# Mustache Spec Compatibility

This directory documents Bigodon's compatibility against the official
[mustache/spec](https://github.com/mustache/spec) test suite, broken down
by feature category. Each file is self-contained: it lists the failing
specs, explains why Bigodon fails them today, and proposes an
implementation (or a "won't fix" rationale).

The user-facing summary lives in [`../README.md`](../README.md) under
**Mustache spec compatibility**.

## Status snapshot

Run on `feat/mustache-spec-tests` against the current `dist/` build:

- **Passing: 103 / 110** attempted Mustache spec tests (94%)
- **Failing: 3** — all `HTML Escaping` variants; deliberate divergence (Bigodon emits raw)
- **Skipped: 84 + 4** — 84 tests in 5 unimplemented feature files (`partials.json`, `~dynamic-names.json`, `delimiters.json`, `~inheritance.json`, `~lambdas.json`), and 4 tests requiring auto context-stack walking (`Parent contexts`, `List Contexts`, `Deeply Nested Contexts`, `Variable test`) — Bigodon uses Handlebars-style strict scoping
- Test runner: `npm run test:spec` (clones `mustache/spec` into `test/mustache/`, executes `test/spec.spec.js`)

### What's been implemented

- Implicit iterator `{{.}}` — `runPathExpression` returns current context for `.`
- Inverted-section empty-array falsy check
- Triple mustache `{{{x}}}` and ampersand `{{&x}}` parsed as raw-emit aliases
- Block heads with literal-named keys (`{{#null}}` etc.) resolve as paths
- Standalone-line whitespace stripping for comments and block open/close tags

### What's deliberately skipped

- The 5 feature files above — see the per-category docs in this directory
- Truthy-scalar context push (`{{#scalar}}{{.}}{{/scalar}}`) — Bigodon's existing semantic is "don't change context for non-object values"
- Auto walk of context stack — use explicit `$parent`/`$root` instead

## Categories

| # | Category | Failures | Spec file(s) | Doc |
|---|----------|---------:|--------------|-----|
| 1 | Triple mustache `{{{x}}}` and ampersand `{{&x}}` | 22 | `interpolation.json`, `sections.json`, `~inheritance.json` | [triple-mustache-and-ampersand.md](triple-mustache-and-ampersand.md) |
| 2 | Standalone-line whitespace stripping | 22 | `comments.json`, `sections.json`, `inverted.json`, `delimiters.json`, `partials.json` | [standalone-line-whitespace.md](standalone-line-whitespace.md) |
| 3 | Set Delimiters `{{=<% %>=}}` | 14 | `delimiters.json` | [set-delimiters.md](set-delimiters.md) |
| 4 | Partials `{{>name}}` | 12 | `partials.json` | [partials.md](partials.md) |
| 5 | Implicit iterator `{{.}}` | 13 | `interpolation.json`, `sections.json` | [implicit-iterator.md](implicit-iterator.md) |
| 6 | Dynamic names `{{*name}}` (optional) | 21 | `~dynamic-names.json` | [dynamic-names.md](dynamic-names.md) |
| 7 | Inheritance `{{<parent}}{{$block}}{{/parent}}` (optional) | 27 | `~inheritance.json` | [inheritance.md](inheritance.md) |
| 8 | Lambdas (optional) | 10 | `~lambdas.json` | [lambdas.md](lambdas.md) |
| 9 | Section context & falsy edge cases | ~10 | `sections.json`, `inverted.json` | [section-falsy-and-context.md](section-falsy-and-context.md) |

Categories 1–2 and 9 are *behavioral* gaps in features Bigodon already
parses. Categories 3–8 are *new features* not currently in Bigodon's
language. The "optional" tag follows the Mustache convention of
prefixing optional spec files with `~`.

## Priority

Ranked by value-for-effort, considering: (a) is this a conformance bug
in something we already claim to support, (b) is this a foundation
other categories depend on, (c) is the feature optional in the spec,
(d) does it conflict with Bigodon's design.

### Tier 1 — Must have (real bugs and cheap wins)

1. **[section-falsy-and-context.md](section-falsy-and-context.md)** — conformance bugs in features Bigodon already advertises. Empty array under `{{^x}}` not rendering the body is plainly wrong. ~5-line fix in `src/runner/block.ts`. Highest value-per-line of code in the list.
2. **[implicit-iterator.md](implicit-iterator.md)** — `{{.}}` is heavily used in real templates and is a small parser change plus a 3-line runtime change. Pairs naturally with the truthy-scalar push from category 1.
3. **[standalone-line-whitespace.md](standalone-line-whitespace.md)** — affects every standalone tag (comments, sections, inverted sections, and later partials/inheritance). Without it, multi-line templates render with extra blank lines that look broken. Also a *foundation*: partials and inheritance need it before they're useful. Medium effort but clearly spec-faithful.

### Tier 2 — Should have (commonly requested, foundational)

4. **[partials.md](partials.md)** — the single most-requested missing feature for any Mustache/Handlebars implementation. Real-world templates use partials for layouts and components. Large effort but well-scoped; unlocks dynamic names and inheritance if those are ever pursued.
5. **[triple-mustache-and-ampersand.md](triple-mustache-and-ampersand.md)** — option A (recognize the syntax as raw-emit) is a tiny parser change since Bigodon already emits raw. Cheap fix for ~21 spec tests. The HTML-escape side (option B) is a separable, opt-in concern.

### Tier 3 — Nice to have

6. **[dynamic-names.md](dynamic-names.md)** — optional spec. Builds entirely on partials, so cost-after-partials is small. Skip unless a concrete use case appears.

### Tier 4 — Recommend "won't fix" (document divergence)

7. **[set-delimiters.md](set-delimiters.md)** — optional concept; Handlebars itself doesn't ship it. Large parser surgery (delimiter rewriting + location-map). Most defensible "won't fix."
8. **[inheritance.md](inheritance.md)** — optional spec. The `$` sigil collides directly with Bigodon's existing variable syntax (`{{$this}}`, `{{$parent}}`); resolving that requires context-sensitive parsing. Largest effort.
9. **[lambdas.md](lambdas.md)** — optional spec. Bigodon's `addHelper` is the deliberate, safer alternative; re-parsing template strings produced by user data cuts against Bigodon's "safely run user templates" framing.

### Suggested implementation order

If pursuing Mustache parity, work in this order so each step builds on the previous:

1. Tier 1 in parallel (independent fixes).
2. `triple-mustache-and-ampersand` option A (cheap; clears 21 tests).
3. `partials` (depends on `standalone-line-whitespace` for indentation reapplication).
4. `dynamic-names` (depends on `partials`).
5. Decide explicitly to skip Tier 4 categories and add their spec files to `SKIPPED_SPECS` in `test/spec.spec.js` so the test signal stays meaningful.

Estimated outcome of Tiers 1–3: from **52/194** today to roughly **155/194** passing (≈80% conformance), with the remainder being deliberate Bigodon divergences.

## How to read each file

Every category file is structured the same way:

- **Summary** — what the Mustache feature does.
- **Failing specs** — verbatim list of test names that fail today.
- **Why it fails today** — pointer to the Bigodon code path that errors or misbehaves.
- **Proposed implementation** — concrete steps: which files to touch, AST shape, version impact.
- **Effort & risk** — small / medium / large, plus coverage and security notes.
- **Won't-fix rationale** — present only where there is a deliberate reason not to implement.

## Versioning notes

Bigodon's parser emits a `version` field on the AST root
(`src/parser/index.ts` — `VERSION = 3`). The runner enforces a
`MIN_VERSION = 1`, `MAX_VERSION = 3` window
(`src/runner/index.ts`). Any change that alters the AST shape — adding a
new statement type, adding fields to existing statements, etc. — must
bump `VERSION` and widen `MAX_VERSION`. Old persisted ASTs outside the
window fail loudly with a "parse it again" error; this is intentional
and must be preserved.

## Test runner

`test/spec.spec.js` exposes two unused hooks at the top:

```js
const SKIPPED_SPECS = [];
const SKIPPED_FEATURES = [];
```

If a category here is decided to be permanently out of scope, add the
spec file (e.g. `'~inheritance.json'`) to `SKIPPED_SPECS` or specific
test-name substrings to `SKIPPED_FEATURES`. That is currently the only
"won't fix" mechanism wired up.
