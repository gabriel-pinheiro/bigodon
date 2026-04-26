# Set Delimiters `{{=<% %>=}}`

## Summary

Mustache lets a template change the open/close delimiters mid-stream:
`{{=<% %>=}}` switches from `{{ }}` to `<% %>` for the rest of the
template (or until the next set-delimiter tag). Bigodon's parser hard-codes
`{{` / `}}` and provides no mechanism to switch.

## Failing specs (14)

From `delimiters.json`:

- `Pair Behavior`
- `Special Characters`
- `Sections`
- `Inverted Sections`
- `Partial Inheritence`
- `Post-Partial Behavior`
- `Surrounding Whitespace`
- `Outlying Whitespace (Inline)`
- `Standalone Tag`
- `Indented Standalone Tag`
- `Standalone Line Endings`
- `Standalone Without Previous Line`
- `Standalone Without Newline`
- `Pair with Padding`

> Note: 5 of these overlap with [standalone-line-whitespace.md](standalone-line-whitespace.md);
> they would still fail until both categories are addressed because the
> set-delimiter tag itself isn't recognized.

## Why it fails today

The parser combinators in `src/parser/utils.ts` (`openMustache`,
`closeMustache`) and the `text` parser (which reads "anything that
isn't `{{`") capture the literal strings `{{` and `}}`. There is no
parser state that could be mutated mid-parse to change those strings.

Even the dispatch on `=` in `src/parser/index.ts` `$template` is
*assignments* (`{{= $foo expr}}`) — Bigodon's variable-assignment
syntax — not Mustache set-delimiters. The two share a leading `=` and
will need to be disambiguated if set-delimiter support is added (e.g.,
`{{= $foo …}}` is assignment; `{{=<% %>=}}` is set-delimiter).

## Proposed implementation

This is the **most invasive** of the eight categories. `pierrejs` is a
combinator library where parsers are pure functions; there is no
built-in mutable parser state. Three options, increasingly drastic:

### Option 1 — Post-process by re-tokenizing (**recommended**)

Instead of teaching the parser combinators about delimiter changes, do a
**preprocessing pass** that rewrites the template string *before* it
hits `$template`:

1. Scan the source character-by-character, tracking the current open/close delimiters.
2. Whenever a set-delimiter tag is found, normalize the rest of the source:
   replace each non-`{{` open delimiter with a placeholder (e.g., `\x00OPEN\x00`)
   and each non-`}}` close delimiter likewise.
3. Strip the set-delimiter tag itself (it produces no output).
4. After the rewrite, every tag in the source uses `{{` / `}}` again, and the existing parser works unmodified.

Locations (`loc.start`/`loc.end`) need to be remapped back to the
original source so error messages still point at the right column. A
small lookup table built during the rewrite handles that.

**Files to touch:**
- New `src/parser/delimiters.ts` — the rewrite + location-map.
- `src/parser/index.ts` — call `rewriteDelimiters(source)` before `Pr.parse(source)`; rewrap errors with the inverse map.
- `src/index.ts` — `parse`/`compile` entry points pass through.

No AST shape change → no `VERSION` bump.

### Option 2 — Stateful parser context

Use `Pr.context` (already used for `mustache` in `$template`) to carry
delimiter state. This requires writing custom replacements for
`openMustache`, `closeMustache`, and `$text` that read the current
delimiters from context. More invasive in the parser; harder to keep
the existing combinators readable.

### Option 3 — Hand-rolled lexer

Replace `pierrejs` for the top level. Out of scope for this category.

## Disambiguating from `{{= $var …}}` assignment

Bigodon's existing `=` branch in `$template` handles assignments like
`{{= $foo expr}}`. Set-delimiter tags also start with `=` after the
leading `{{`. The disambiguation: if the next non-space character after
`=` is `$`, it's an assignment; otherwise it's a set-delimiter (the
delimiter chars are restricted to non-whitespace, non-`=`, non-`$`
sequences per the spec — see Mustache's `delimiters.yml`).

## Effort & risk

- Option 1 (recommended): **Medium-large.** ~1 day of careful work, mostly in delimiter rewrite + location-map plus tests for the location-map.
- Option 2: **Large.** Touches the heart of the parser.
- Risk: If location remapping is wrong, error messages mislocate, hurting Bigodon's "human-friendly errors" claim — that's a regression worth guarding with explicit tests.

## Won't-fix rationale

Worth considering. Set Delimiters is a feature with limited real-world
demand for Handlebars-style templates (Handlebars itself doesn't ship
it). If the user wants Bigodon to remain "Handlebars+", set-delimiters
is the most defensible "won't fix" of the eight. Document the
divergence and add `'delimiters.json'` to `SKIPPED_SPECS` in
`test/spec.spec.js`.
