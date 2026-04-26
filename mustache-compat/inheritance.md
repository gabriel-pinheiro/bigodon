# Inheritance `{{<parent}}{{$block}}…{{/parent}}` (optional)

## Summary

An *optional* Mustache feature (the `~inheritance.json` filename is
prefixed with `~`) that adds template inheritance:

- `{{<parent}}…{{/parent}}` — invoke `parent` as the layout, with overrides inside.
- `{{$blockName}}default{{/blockName}}` — declare a named block in the parent or override one when nested under `{{<parent}}`.
- The parent template is rendered with each block's content replaced by any override the caller supplied; otherwise the block's default is used.

Bigodon has neither parents nor named blocks.

## Failing specs (27)

From `~inheritance.json`:

- `Default`
- `Variable`
- `Triple Mustache` (also in [triple/ampersand](triple-mustache-and-ampersand.md))
- `Sections`
- `Negative Sections`
- `Mustache Injection`
- `Inherit`
- `Overridden content`
- `Data does not override block`
- `Data does not override block default`
- `Overridden parent`
- `Two overridden parents`
- `Override parent with newlines`
- `Inherit indentation`
- `Only one override`
- `Parent template`
- `Recursion`
- `Multi-level inheritance`
- `Multi-level inheritance, no sub child`
- `Text inside parent` (×2 — there are two tests with this name in the spec file)
- `Block scope`
- `Standalone parent`
- `Standalone block`
- `Block reindentation`
- `Intrinsic indentation`
- `Nested block reindentation`

## Why it fails today

Two distinct parse failures:

- `{{<parent}}` — the `<` after `{{` is not a recognized sigil; falls into `$expression` which fails with `Expected literal, helper or context path`.
- `{{$block}}` — Bigodon already uses `$` for *variables* (e.g. `{{$this}}`, `{{$parent}}`). The parser interprets `{{$block}}` as a variable reference, then `{{/block}}` is encountered without an open block and fails with `Unexpected {{/block}}, this block wasn't opened`.

The `$` collision is the awkward part — Bigodon and Mustache use the same character for different things.

## Proposed implementation

Prerequisite: [partials.md](partials.md) (parents are essentially
inheritable partials) and ideally [standalone-line-whitespace.md](standalone-line-whitespace.md).

### AST

Two new statement types in `src/parser/statements.ts`:

```ts
export type ParentStatement = {
    type: 'PARENT';
    loc: Location;
    name: string;
    indent: string;
    overrides: BlockOverrideStatement[];
};

export type BlockOverrideStatement = {
    type: 'BLOCK_OVERRIDE';
    loc: Location;
    name: string;
    statements: Statement[];
};
```

Bump `VERSION` (e.g. to 6 once partials/dynamic-names land), widen
`MAX_VERSION`.

### Parser

In `src/parser/index.ts` `$template`, add two new branches:

- `<` — opens a parent (`{{<name}}`); pushes a `ParentStatement` onto the parser stack. Until the matching `{{/name}}`, only `BLOCK_OVERRIDE` statements (and whitespace text) may appear at the top level of the parent body — anything else is an error per the spec.
- `$` — currently routed to `$assignment` because Bigodon uses `{{= $foo expr}}` and `{{$this}}`. The new branch needs disambiguation:
  - If the immediate next token is `=` → assignment.
  - If the next token is a path that resolves to a variable (`$this`, `$parent`, `$root`) → variable reference (existing behavior).
  - Otherwise (a bare identifier following `$`) → block declaration: `{{$name}}…{{/name}}`.

Disambiguation is tricky — current Bigodon code treats `$` as part of
the variable name. To avoid breaking existing templates, prefer
introducing the inheritance `$` syntax only **inside a `{{<parent}}` body**;
outside of a parent body, `{{$x}}` keeps its current "variable
reference" meaning. This preserves backward compatibility but is a
context-sensitive parse rule.

### Runner

In `runStatement` (`src/runner/index.ts`):

- New `PARENT` case: resolve the parent template by name (via the partials map), collect the `overrides` map by name, then run the parent's statements, swapping in override content whenever a `BLOCK_OVERRIDE` is rendered.
- New `BLOCK_OVERRIDE` case: when running inside a parent context, look up its name in the active overrides; render the override's statements if present, otherwise render the default.

Multi-level inheritance (a parent inheriting from another parent)
requires a stack of override scopes — child overrides take priority.
The spec includes recursion tests; the same `maxExecutionMillis` /
`maxPartialDepth` guards from [partials.md](partials.md) cover them.

### Re-indentation

`Inherit indentation`, `Block reindentation`, and `Intrinsic
indentation` require that when a block is overridden inside a
standalone parent invocation, the override's lines pick up the parent's
indentation. Same machinery as partial indentation — implement once and
reuse.

### Files to touch

- `src/parser/statements.ts` — `ParentStatement`, `BlockOverrideStatement`.
- `src/parser/index.ts` — new `<` branch, contextual `$` branch, version bump.
- `src/runner/index.ts` — version-window widen, two new switch cases.
- `src/index.ts` — overrides probably reuse the partials map registered via `addPartial`.
- `LANGUAGE.md`, `LIB.md` — document.

## Effort & risk

- **Large.** Touches parser disambiguation, AST, runner, partials integration, and indentation. Realistic ~3–4 days.
- Risk: high for `$` disambiguation — easy to break existing Bigodon
  templates. The "only inside `{{<parent}}` body" scoping mitigates
  this but adds parser state.

## Won't-fix rationale

Reasonable to skip. Inheritance is *optional* in Mustache. The largest
known consumer of Bigodon (Mocko, per the README) is unlikely to need
template inheritance for mock generation. If skipped, add
`'~inheritance.json'` to `SKIPPED_SPECS` in `test/spec.spec.js` and
note it in [README.md](../README.md). Inheritance is the strongest
"won't fix" candidate of the eight categories alongside set-delimiters.
