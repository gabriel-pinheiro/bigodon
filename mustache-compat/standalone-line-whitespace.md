# Standalone-Line Whitespace Stripping

## Summary

Mustache defines a "standalone line" as any line whose only non-whitespace
content is a single tag from a specific set: comments (`{{! …}}`),
section openers/closers (`{{#x}}`, `{{/x}}`, `{{^x}}`), partials
(`{{>p}}`), set-delimiters (`{{=<% %>=}}`), and
inheritance/dynamic-name variants. When a line is standalone, the
*entire line* — leading whitespace, the tag, and the trailing newline —
is consumed from the output. Variable interpolation tags
(`{{x}}`, `{{{x}}}`, `{{&x}}`) are deliberately excluded.

Bigodon emits each standalone tag's surrounding whitespace verbatim, so
spec test outputs end up with extra blank lines and indentation.

## Failing specs (22)

From `comments.json`:

- `Standalone`
- `Indented Standalone`
- `Standalone Line Endings`
- `Standalone Without Previous Line`
- `Standalone Without Newline`
- `Multiline Standalone`
- `Indented Multiline Standalone`

From `sections.json`:

- `Standalone Lines`
- `Indented Standalone Lines`
- `Standalone Line Endings`
- `Standalone Without Previous Line`
- `Standalone Without Newline`

From `inverted.json`:

- `Standalone Lines`
- `Standalone Indented Lines`
- `Standalone Line Endings`
- `Standalone Without Previous Line`
- `Standalone Without Newline`

From `delimiters.json` (only the standalone-related ones — the rest are
covered by [set-delimiters.md](set-delimiters.md)):

- `Standalone Tag`
- `Indented Standalone Tag`
- `Standalone Line Endings`
- `Standalone Without Previous Line`
- `Standalone Without Newline`

> The `partials.json` standalone tests are listed under
> [partials.md](partials.md) since the partial feature is itself
> missing; once partials exist, the same whitespace rule applies.

## Why it fails today

The parser in `src/parser/index.ts` does no
adjacency analysis between TEXT statements and the tags around them.
`$text` reads any non-`{{` characters into a `TextStatement` and pushes
it; `$comment`/`BLOCK` open/close tags are then pushed alongside as
sibling statements. Trailing newlines and leading indentation are
preserved inside `TextStatement.value`. The runner just concatenates
text values verbatim.

There is no notion of "this line was standalone, drop my surrounding
whitespace."

## Proposed implementation

This is a *post-parse* transform on the statement list. Best done in
`src/parser/index.ts` after `$template` returns, before the result is
returned to the caller.

### Algorithm

For each statement list (top-level and every block's `statements` /
`elseStatements`):

1. Walk pairs `(prev, current, next)` where `current` is one of:
   `COMMENT`, `BLOCK` (opener line), block close marker, partial,
   set-delimiter, inheritance opener/closer.
2. The line is "standalone" if:
   - The TEXT before `current` ends with `\n` (or `current` is the
     first statement), and any characters after that newline are
     whitespace only.
   - The TEXT after `current` starts with whitespace-only chars up to
     and including the first `\n` (or it is the last statement and only
     trailing whitespace remains).
3. If standalone, strip:
   - From `prev` TEXT: drop the trailing whitespace after the last `\n` (keep the newline).
   - From `next` TEXT: drop the leading whitespace and the first `\n`.
4. Indented partials are an extra wrinkle (the indentation is supposed to be re-applied to every line of the partial output) — only relevant once partials land.

### Files to touch

- `src/parser/index.ts` — add a post-walk function `stripStandaloneLines(template)` that mutates `statements` recursively. Call it once before `$template`'s `.map(({ type, ...v }, loc) => ({ type, loc, ...v }))`.
- `src/parser/statements.ts` — no shape change needed; whitespace lives inside existing TEXT values.

No AST `version` bump is required — the AST is the same shape, only
text contents differ.

### Block opener/closer subtlety

A `BlockStatement` represents both `{{#x}}` *and* `{{/x}}`. The
"standalone" check needs to be applied independently to the line
containing the opener and the line containing the closer. The current
AST records `BlockStatement.loc` (start = `{{#`, end = `}}` of the
closer), so the opener's surrounding text is the `prev` text **outside**
the block plus the **first** TEXT inside `block.statements`. The
closer's surrounding text is the **last** TEXT inside `block.statements`
plus the next TEXT **outside** the block. That requires the transform
to look across block boundaries — workable but a little fiddly.

## Effort & risk

- **Medium.** The algorithm is well-specified by the Mustache spec
  (`MUSTACHE.md` § "Standalone Tags") but boundary cases (first/last
  statement, nested blocks, `\r\n` vs `\n`) need careful handling.
- Risk: low for new outputs (it can only remove whitespace, never add
  it), but **could regress existing Bigodon tests** if a current test
  asserts on a template with whitespace that would now be stripped. Run
  the full `npm test` suite, not just `test:spec`.

## Won't-fix rationale

None — this is faithful to a clear Mustache rule and doesn't conflict
with Bigodon's design.
