# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Bigodon is a Handlebars/Mustache-style templating library focused on safely evaluating user-provided templates. Templates are parsed into a JSON AST and interpreted at runtime — they are never compiled to JavaScript. Helpers can be async. Published to npm as `bigodon`.

User-facing docs: `README.md`, `LIB.md` (API), `LANGUAGE.md` (template syntax), `HELPERS.md` (built-in helpers).

## Common commands

The package declares `packageManager: yarn@4.14.1` and ships `.yarn/`, `.yarnrc.yml`, `yarn.lock` — use Yarn locally. The npm scripts still work and are what CI runs.

- `npm run build` — compile `src/` → `dist/` via `tsc` (clears `dist/` first via `prebuild`).
- `npm test` — runs `pretest` (build) then `lab -v -t 100 -I require -a @hapi/code` against `test/**/*.spec.js`. The `-t 100` enforces 100% coverage; tests run against the built `dist/`, so a stale build will mask source changes — run through `npm test` (which rebuilds), not `lab` directly.
- `npm run test:cov` — same suite, emits `coverage.html`.
- Run a single test file: `npm run build && npx lab -v -I require -a @hapi/code test/parser/parser.spec.js` (or use `--grep "<pattern>"` to filter cases).
- `npm run lint` / `npm run lint:fix` — ESLint over `src/**/*.ts` using the flat config in `eslint.js`.

Node ≥ 18 is required.

## Architecture

The library is split into two phases that can run in different processes; the AST in between is plain JSON.

### Parser (`src/parser/`)

Built on top of `pierrejs` parser combinators. Entry point `$template` (`src/parser/index.ts`) tokenizes a template into a `TemplateStatement` AST. Statement shapes (TEXT, COMMENT, MUSTACHE, EXPRESSION, BLOCK, LITERAL, VARIABLE, ASSIGNMENT, TEMPLATE) are defined in `src/parser/statements.ts`.

The parser emits a `version` on the root template (`VERSION` constant in `src/parser/index.ts`). The runner enforces `MIN_VERSION`/`MAX_VERSION` (`src/runner/index.ts`) — when changing AST shape, bump `VERSION` and update the supported range so old persisted ASTs fail loudly with "parse it again". Don't widen the range silently.

Block parsing uses an explicit stack with a notion of "nested" blocks for `{{else if}}` chains, which auto-close when their parent closes. Path/literal/variable expressions live in `expression.ts`, `literal.ts`, `variables.ts` respectively.

### Runner (`src/runner/`)

`run(ast, context, extraHelpers, options)` interprets the AST. Per-execution state lives in `Execution` (`src/runner/execution.ts`):
- `contexts` is a stack pushed/popped by blocks so `$parent`/`$root`/`$this` work.
- `variables` backs `{{= $var ...}}` assignments.
- `data` is helper-only side-channel state (templates can't read it; helpers mutate it via `this.data`).
- `maxExecutionMillis` is checked at the top of every `runStatement` — flow-control helpers can also `halt()` execution, which short-circuits `runStatements`.
- `allowDefaultHelpers` (default true) toggles the bundled helpers off; extra helpers added via `addHelper` always run.

Statement dispatch is the `switch` in `runStatement`. Adding a new statement type means: define it in `parser/statements.ts`, parse it, add a `case` here, and rely on the trailing `statement satisfies never` to surface missed branches at compile time.

Helper resolution (`src/runner/helper.ts`): user-registered helpers in `execution.extraHelpers` win over built-ins. `UNSAFE_KEYS` (from `src/utils.ts`) blocks prototype-pollution-style helper names like `__proto__` — keep that check whenever touching helper lookup. Helper params are evaluated in parallel via `Promise.all`; helpers receive `Execution` as `this`.

Bare-identifier expressions (no params) are ambiguous between path access and a no-arg helper call. The disambiguation in `runExpression` is: if a helper exists with that name (extra or default), call it; otherwise treat it as a path. This means registering a helper can shadow a context key with the same name.

### Built-in helpers (`src/runner/helpers/`)

Grouped by category (`array`, `code`, `comparison`, `date`, `math`, `string`) and merged in `helpers/index.ts` into a null-prototype object. When adding a helper, put it in the matching file, export through that group, and add tests under `test/helpers/<group>.spec.js`. New helpers must also be documented in `HELPERS.md` — that file is the public contract.

A few helpers (`sort`, `splice`) are explicitly written to not mutate their input arrays; preserve that invariant when editing them (see commits `c91f910`, `d12b04c`).

### Public API surface (`src/index.ts`)

Exports a `Bigodon` class plus pre-bound `parse`, `parseExpression`, `run`, `runExpression`, `compile`, `compileExpression` from a default singleton. The module-level convenience exports do **not** carry user helpers — `addHelper` only affects the instance it's called on, so users wanting custom helpers must `new Bigodon()`.

## Tests

`@hapi/lab` with `@hapi/code` for assertions. Tests are plain JS (`test/**/*.spec.js`) and import from the built `dist/` (that's what `-I require` and the `pretest` step are for). Coverage threshold is 100% (`-t 100`); use `/* $lab:coverage:off$ */ … /* $lab:coverage:on$ */` only for genuinely unreachable branches (TypeScript exhaustiveness guards), as already done in the parser/runner.

`test/security.spec.js` covers prototype pollution, sandbox escapes, and execution-time limits — touch helper resolution, `Execution`, or `deepCloneNullPrototype` carefully and re-run that file.

## Conventions

- 4-space indent, single quotes, trailing commas, `'as-needed'` arrow parens — enforced by `eslint.js`.
- Source is TypeScript targeting `es2019`/`commonjs`; declarations are emitted to `dist/`. Don't import from `dist/` inside `src/`.
- Don't introduce runtime dependencies casually — currently only `pierrejs`. The library's value prop is "safe to run on user input", so new deps are scrutinized.
