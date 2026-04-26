# Partials `{{>name}}`

## Summary

A Mustache partial expands an inline reference to another named
template into the current template at parse/render time. The partial
can be recursive, can carry the current context, and — when standalone
— must re-apply its caller's indentation to every line of its rendered
body.

Bigodon has no concept of partials.

## Failing specs (12)

From `partials.json`:

- `Basic Behavior`
- `Failed Lookup`
- `Context`
- `Recursion`
- `Nested`
- `Surrounding Whitespace`
- `Inline Indentation`
- `Standalone Line Endings`
- `Standalone Without Previous Line`
- `Standalone Without Newline`
- `Standalone Indentation`
- `Padding Whitespace`

## Why it fails today

The parser dispatch in `src/parser/index.ts` `$template` has no `>`
branch. A `{{>foo}}` template hits the `default` branch and tries to
parse `>foo` as a `$expression`, failing with `Expected literal, helper
or context path`.

The runner has no partials registry, no recursion guard, no context
plumbing for them.

## Proposed implementation

### AST

Add a new statement type to `src/parser/statements.ts`:

```ts
export type PartialStatement = {
    type: 'PARTIAL';
    loc: Location;
    name: string;
    indent: string; // captured leading whitespace if standalone, '' otherwise
};
```

Update the `Statement` union and the `runStatement` exhaustiveness
guard (`statement satisfies never` in `src/runner/index.ts`).

### Parser

In `src/parser/index.ts` `$template`, add a `>` branch in the `peek`
switch:
- Consume `>`.
- Parse the partial name (alphanumeric / dotted identifier — same rules as `$expression` paths but without parameters).
- Push a `PartialStatement`.

The `indent` field is filled by the standalone-line transform (see
[standalone-line-whitespace.md](standalone-line-whitespace.md)) — when
a partial tag is on a standalone line, capture the leading whitespace
on that line into `indent`.

Bump `VERSION` in `src/parser/index.ts` to 4 and widen `MAX_VERSION` to
4 in `src/runner/index.ts`.

### Runner

Two questions to answer before coding:

1. **Where do partials come from?** Two reasonable answers:
   - **Caller-supplied map**: extend `RunOptions` (`src/runner/options.ts`) with `partials: Record<string, string | TemplateStatement>`. Strings get parsed lazily; pre-parsed ASTs are used as-is. This matches the Bigodon design: parsing and running can happen in different processes.
   - **Bigodon-instance-scoped**: add `addPartial(name, source)` on the `Bigodon` class (`src/index.ts`), parallel to `addHelper`.

   Recommended: both — `addPartial` writes into a per-instance map that becomes the default `options.partials` value, but callers can override.

2. **How is recursion bounded?** The existing `Execution.maxExecutionMillis` already covers infinite recursion, but the `runStatement` switch has to be careful not to blow the call stack. Add a soft `maxPartialDepth` (default e.g. 64) for clearer errors.

In `runStatement`'s new `PARTIAL` case:

- Look up `name` in `execution.options.partials` and `Bigodon` instance map.
- On miss, the spec wants empty output (not an error) — see the `Failed Lookup` test.
- On hit:
  - If string, parse on demand (cache the resulting AST inside the execution to handle recursion fairly).
  - Push current context unchanged (partials inherit context).
  - If `indent` is non-empty, render the partial's output and prefix every line break with `indent`.
  - Run the partial's statements via `runStatements`.
  - Increment/decrement a depth counter on `Execution`.

### Files to touch

- `src/parser/statements.ts` — new `PartialStatement` type.
- `src/parser/index.ts` — new `>` branch, version bump.
- `src/runner/index.ts` — version-window widen, new `PARTIAL` case.
- `src/runner/options.ts` — `partials` option, optional `maxPartialDepth`.
- `src/index.ts` — `addPartial` on the `Bigodon` class.
- `LIB.md`, `LANGUAGE.md` — document.

### Security

Bigodon's headline claim is "safe to run on user input." Partials need
the same scrutiny:

- The partial *body* is parsed by the same trusted parser, so prototype-pollution / sandbox escapes are no worse than today's parser.
- A user-controlled partial **name** that hits a caller-supplied map could leak templates the caller didn't intend to expose. Document explicitly that the partials map should be a closed allowlist, not a function that resolves arbitrary paths.
- Re-run `test/security.spec.js` after the change.

## Effort & risk

- **Large.** New AST type, version bump, parser branch, runner case, options surface, public-API addition, plus standalone whitespace + indentation reapplication. Realistic ~2–3 days with tests and docs.
- Risk: medium. Adds a new public API (`addPartial`); naming and signature decisions are sticky. Worth a focused design doc / PR description before coding.

## Won't-fix rationale

None. Partials are the most-requested missing feature for Mustache
parity and have well-understood semantics. The main reason to delay is
sequencing: implement [standalone-line-whitespace.md](standalone-line-whitespace.md)
first, since several partial tests depend on it.
