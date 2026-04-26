# Implicit Iterator `{{.}}`

## Summary

In Mustache, `{{.}}` resolves to the *current context* — useful when
iterating a list of scalars: `{{#items}}{{.}}{{/items}}` over
`["a", "b", "c"]` produces `"abc"`. The lone `.` is also called the
"implicit iterator." Bigodon supports `$this` (its named equivalent)
but does not parse a bare `.`.

## Failing specs (13)

From `interpolation.json`:

- `Implicit Iterators - Basic Interpolation`
- `Implicit Iterators - HTML Escaping` (also blocked by [triple/ampersand](triple-mustache-and-ampersand.md))
- `Implicit Iterators - Triple Mustache` (also blocked by triple/ampersand)
- `Implicit Iterators - Ampersand` (also blocked by triple/ampersand)
- `Implicit Iterators - Basic Integer Interpolation`

From `sections.json`:

- `Implicit Iterator - String`
- `Implicit Iterator - Integer`
- `Implicit Iterator - Decimal`
- `Implicit Iterator - Array`
- `Implicit Iterator - HTML Escaping`
- `Implicit Iterator - Triple mustache` (also blocked by triple/ampersand)
- `Implicit Iterator - Ampersand` (also blocked by triple/ampersand)
- `Implicit Iterator - Root-level`

## Why it fails today

`src/parser/expression.ts` parses paths as identifier sequences
separated by `.`. A leading `.` with nothing before it is not accepted;
the parser fails with `Expected literal, helper or context path`.

At runtime, Bigodon already exposes `$this` for the same purpose
(`src/runner/path-expression.ts` resolves the `$this` magic name to the
top of the context stack). So the runtime already does the right thing
— only the parse rule is missing.

## Proposed implementation

### Parser

In `src/parser/expression.ts` (and wherever path identifiers are
recognized), allow a single `.` token as a valid path expression. Two
ways:

1. **Treat `.` as sugar for `$this`.** The parser produces an `EXPRESSION` whose `path` is `$this`. Zero changes to runtime; existing path-resolution handles it.
2. **Add a new path representation `'$current'`** and route it through the same code path as `$this` in `src/runner/path-expression.ts`.

Approach 1 is strictly simpler and recommended. It also means `{{.foo}}`
(dotted access from current context) works for free if Bigodon already
supports `{{$this.foo}}` (it does).

### Runtime

No change required if approach 1 is taken.

### Section context push for scalars

Three of the failing tests (`Implicit Iterator - String`,
`Implicit Iterator - Integer`, `Implicit Iterator - Decimal`) iterate
over a single scalar. Bigodon's `runBlock`
(`src/runner/block.ts`) currently has this branch order:

```ts
if (Array.isArray(value)) { /* push each item, render */ }
if (typeof value === 'object') { /* push, render */ }
return await runStatements(execution, block.statements); // truthy scalar — does NOT push
```

For Mustache compatibility, a truthy scalar block also needs to push
the value as the current context so `{{.}}` inside resolves to it. Add
a fourth branch before the final `return`:

```ts
execution.pushContext(value);
const result = await runStatements(execution, block.statements);
execution.popContext();
return result;
```

This is a behavior change for any existing Bigodon templates that use
`{{#scalar}}…{{/scalar}}` over a non-array, non-object value. Today
those run with the parent context still on top; after the change,
`$this` and `.` would resolve to the scalar. Risk is low because such
usage is unusual in Handlebars idioms (which prefer `{{#if}}`), but
worth a release note.

### AST shape change?

No. `.` parses to an existing expression shape. No `VERSION` bump.

### Files to touch

- `src/parser/expression.ts` — accept `.` as a path expression.
- `src/runner/block.ts` — push truthy scalars onto the context stack.
- `LANGUAGE.md` — document `{{.}}` as an alias of `{{$this}}`.

## Effort & risk

- **Small-medium.** ~half a day. Parser change is local; the runner
  change is a 3-line patch but needs a careful re-read of existing
  block tests in `test/runner/block.spec.js`.
- Risk: medium for the runner change (existing template behavior shift
  for truthy scalars). Low for the parser change.

## Won't-fix rationale

None. `.` is small, useful, and aligns with existing `$this` semantics.
