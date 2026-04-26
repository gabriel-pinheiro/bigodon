# Dynamic Names `{{*name}}` (optional)

## Summary

Dynamic Names is an *optional* Mustache feature (filename starts with
`~`) that lets a partial's name come from a runtime variable rather
than a literal: `{{>*foo}}` looks up `foo` in the current context and
uses its string value as the partial name. Combined with dotted names
(`{{>*foo.bar}}`), it enables registry-style template selection.

This category is entirely on top of [partials.md](partials.md) — if
partials are not implemented, dynamic names cannot be either.

## Failing specs (21)

From `~dynamic-names.json`:

- `Basic Behavior - Partial`
- `Basic Behavior - Name Resolution`
- `Context Misses - Partial`
- `Failed Lookup - Partial`
- `Context`
- `Dotted Names`
- `Dotted Names - Operator Precedence`
- `Dotted Names - Failed Lookup`
- `Dotted names - Context Stacking`
- `Dotted names - Context Stacking Under Repetition`
- `Dotted names - Context Stacking Failed Lookup`
- `Recursion`
- `Dynamic Names - Double Dereferencing`
- `Dynamic Names - Composed Dereferencing`
- `Surrounding Whitespace`
- `Inline Indentation`
- `Standalone Line Endings`
- `Standalone Without Previous Line`
- `Standalone Without Newline`
- `Standalone Indentation`
- `Padding Whitespace`

## Why it fails today

The parser doesn't recognize `*` after `>`. Templates like `{{>*foo}}`
are rejected by `$expression` with `Expected literal, helper or context
path` since `*` isn't a path character.

## Proposed implementation

Prerequisite: [partials](partials.md) must land first.

### Parser

Extend the partial-name parser added in
[partials.md](partials.md) to optionally accept a leading `*`:

- `{{>name}}` → `PartialStatement { name: 'name', dynamic: false }`
- `{{>*name}}` → `PartialStatement { name: 'name', dynamic: true }`

Add a `dynamic: boolean` field to `PartialStatement`. AST shape change
→ bump `VERSION` (e.g. to 5 if partials are version 4) and widen
`MAX_VERSION` accordingly.

### Runner

In the new `PARTIAL` case (introduced by the partials work), if
`dynamic` is true:

1. Resolve `name` as a path expression against the current context (use the existing path resolver in `src/runner/path-expression.ts`).
2. The resolved value must be a string; otherwise the spec says the lookup fails silently → emit empty.
3. Use the resolved string as the partial name and proceed as for static partials.

### Files to touch

- `src/parser/statements.ts` — add `dynamic` to `PartialStatement`.
- `src/parser/index.ts` — accept optional `*`, version bump.
- `src/runner/index.ts` — version-window widen, dynamic resolution in `PARTIAL` case.
- `LANGUAGE.md` — document.

## Effort & risk

- **Small (after partials).** ~half a day on top of the partials work.
- Risk: low. The hard parts (recursion, indentation) are already in partials.

## Won't-fix rationale

Acceptable to skip. Dynamic Names is *optional* in the Mustache spec
and the use case (data-driven partial selection) is uncommon for
Handlebars-style usage. If skipped, add `'~dynamic-names.json'` to
`SKIPPED_SPECS` in `test/spec.spec.js`.
