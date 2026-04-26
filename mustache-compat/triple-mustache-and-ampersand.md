# Triple Mustache `{{{x}}}` and Ampersand `{{&x}}`

## Summary

In Mustache, `{{x}}` HTML-escapes the value, while `{{{x}}}` and `{{&x}}`
emit it raw. Bigodon does not HTML-escape by default — it treats every
`{{x}}` as raw output — so the *behavior* the tests want already
happens. The gap is purely syntactic: Bigodon's parser does not
recognize the triple-brace or ampersand forms and rejects them at
parse time.

## Failing specs (22)

From `interpolation.json`:

- `Triple Mustache`
- `Ampersand`
- `Triple Mustache Integer Interpolation`
- `Ampersand Integer Interpolation`
- `Triple Mustache Decimal Interpolation`
- `Ampersand Decimal Interpolation`
- `Triple Mustache Null Interpolation`
- `Ampersand Null Interpolation`
- `Triple Mustache Context Miss Interpolation`
- `Ampersand Context Miss Interpolation`
- `Dotted Names - Triple Mustache Interpolation`
- `Dotted Names - Ampersand Interpolation`
- `Implicit Iterators - Triple Mustache` (also blocked by category 5)
- `Implicit Iterators - Ampersand` (also blocked by category 5)
- `Triple Mustache - Surrounding Whitespace`
- `Ampersand - Surrounding Whitespace`
- `Triple Mustache - Standalone`
- `Ampersand - Standalone`
- `Triple Mustache With Padding`
- `Ampersand With Padding`

From `interpolation.json` (escaping):

- `HTML Escaping` — fails because Bigodon does *not* HTML-escape `{{x}}`. This is the inverse of the others: spec expects escaping, Bigodon emits raw.

From `sections.json`:

- `Implicit Iterator - HTML Escaping` (also blocked by category 5)

> Note: the `~inheritance.json` `Triple Mustache` test fails for the
> same syntax reason but is double-counted in
> [inheritance.md](inheritance.md) since the test template also uses
> inheritance syntax.

## Why it fails today

`src/parser/index.ts` `$template` opens a mustache with `openMustache`
(matching `{{`) and then dispatches based on the first character:
`!`, `=`, `#`, `^`, `/`, or default. Neither `{` (the second `{` of
`{{{`) nor `&` is a recognized branch, so the inner `$expression`
parser is invoked and fails with `Expected literal, helper or context
path`.

`HTML Escaping` is a different shape: the template parses fine, but
runtime output isn't escaped. Search for "escape" in `src/runner/`
returns no hits — there is no escaping pipeline at all.

## Proposed implementation

Two independent sub-tasks:

### A. Accept `{{{x}}}` and `{{&x}}` as raw-emit syntax

Bigodon already emits raw, so semantically these become aliases of
`{{x}}`. The change is parser-only:

- In `src/parser/index.ts` `$template`, add two new branches inside the
  `peek` switch:
  - `&` — consume the `&`, parse `$expression`, push a `MustacheStatement` (no AST shape change).
  - `{` — consume the `{`, parse `$expression`, then require an extra closing `}` *before* `optionalSpaces` and the standard `closeMustache`.
- No new statement type needed; no AST `version` bump needed.
- Existing `MustacheStatement` already covers the runtime path.

### B. Add HTML escaping for `{{x}}`

This is a behavioral change with broad blast radius — every existing
template that emits HTML-bearing data would change output. Recommended
**only behind an option**:

- Add `htmlEscape: boolean` to `RunOptions` (`src/runner/options.ts`), default `false` for backwards compatibility.
- In the `MUSTACHE` case of `runStatement` (`src/runner/index.ts`), if `options.htmlEscape` is true and the source statement is plain `{{x}}` (not triple/ampersand), pass the result through an escape helper.
- Distinguishing `{{x}}` from `{{{x}}}`/`{{&x}}` requires a flag on `MustacheStatement` (`isRaw: true`) — that **is** an AST shape change, so bump `VERSION` to 4 and widen `MAX_VERSION` to 4 in `src/runner/index.ts`.

Recommended split: ship A first (zero-risk, fixes ~21 tests), then
decide on B separately. Without B, `HTML Escaping` keeps failing.

## Effort & risk

- A: **Small.** Parser-only, no AST change, no version bump.
- B: **Medium.** AST change, version bump, behavior change, plus
  a security review angle (escaping must cover `& < > " '` per the
  spec's escape table).
- Risk for A: low; the new branches are additive and disjoint from
  existing parsing.
- Risk for B: medium. Default-off mitigates regressions, but adding
  escaping at all opens questions about consistency (helpers that
  produce HTML, etc.).

## Won't-fix rationale

None. A is cheap and fixes most of the category. B is optional but
defensible.
