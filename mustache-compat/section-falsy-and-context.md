# Section Context & Falsy Edge Cases

## Summary

A small handful of section/inverted tests fail not because of missing
syntax but because Bigodon's runtime semantics for `{{#x}}…{{/x}}` and
`{{^x}}…{{/x}}` differ from Mustache in narrow ways:

- Behavior over scalar values (string, number) — Bigodon does not push
  them onto the context stack, so `{{.}}` and parent-context lookup
  inside the section don't work.
- Whitespace produced by repeated standalone tags
  (`Doubled` tests) — overlaps with
  [standalone-line-whitespace.md](standalone-line-whitespace.md).

Most of these are *also* affected by other categories
([implicit-iterator](implicit-iterator.md),
[standalone-line-whitespace](standalone-line-whitespace.md)) but they
need a runtime-level fix that doesn't fit either of those docs cleanly.

## Failing specs (~10)

From `sections.json`:

- `Null is falsey` — `{{#null}}…{{/null}}` over an explicit `null`
  value should render nothing; today Bigodon's check is `!value`, which
  *should* handle `null` — needs verification (could be a
  null-prototype lookup quirk).
- `Parent contexts` — names missing in the current context must be looked up in the parent stack.
- `Variable test` — depends on [implicit-iterator](implicit-iterator.md) (`{{.}}`).
- `List Contexts` — deeply nested list iteration with parent-context lookups.
- `Deeply Nested Contexts` — same, with object contexts.
- `Doubled` — two sections separated by text on standalone lines (overlaps with [standalone-line-whitespace](standalone-line-whitespace.md)).

From `inverted.json`:

- `Null is falsey` — same as the sections version, on the inverted path.
- `Empty List` — `{{^list}}…{{/list}}` with `list: []` should render the body. Bigodon's `runBlock` already guards `Array.isArray(value) && value.length === 0` on the *positive* path; the negation in `block.isNegated` may or may not symmetrically include this — needs confirmation.
- `Doubled` — same standalone-line overlap.

## Why it fails today

`src/runner/block.ts` `runBlock` is the relevant code:

```ts
// Negated blocks
if (block.isNegated) {
    if (value && Array.isArray(block.elseStatements)) { … }
    if (value) return null;
    return await runStatements(execution, block.statements);
}

// Falsy or empty array
if (!value || (Array.isArray(value) && value.length === 0)) { … return null; }

// Non-empty array — push each item, render
if (Array.isArray(value)) { … pushContext / popContext / runStatements … }

// Object — push, render
if (typeof value === 'object') { … pushContext / popContext / runStatements … }

// Truthy scalar — render WITHOUT pushing context
return await runStatements(execution, block.statements);
```

Two gaps relative to the spec:

1. **Inverted + empty list:** The negated branch checks `if (value)`, but `value` for `[]` is truthy in JavaScript (`Boolean([]) === true`), so an empty list takes the "value is true → render nothing" branch. Mustache wants empty lists to be falsy, so the negated body **should** render. Fix: the negated branch needs the same `Array.isArray(value) && value.length === 0` guard the positive branch has.
2. **Truthy scalar context:** The final branch renders the body but does not push the scalar value onto the context stack. Mustache wants `{{#foo}}` over `foo: "bar"` to push `"bar"` so `{{.}}` resolves to it. (Same fix is recommended in [implicit-iterator.md](implicit-iterator.md); this doc is the place to track the *runtime* change while implicit-iterator covers the *parser* change.)

`Parent contexts` requires that the path resolver walk *up* the
context stack when a name isn't found in the current frame. Bigodon's
`src/runner/path-expression.ts` already implements lookup; the failing
test specifically uses dotted paths whose first segment is missing in
the current frame. Whether walking happens correctly for that shape
needs to be confirmed — likely a small bug rather than a missing
feature.

## Proposed implementation

Three small, surgical patches:

### Patch A — Empty list under inverted block

In `src/runner/block.ts`, change the `if (block.isNegated)` branch to
treat empty arrays as falsy:

```ts
const isFalsy = !value || (Array.isArray(value) && value.length === 0);

if (block.isNegated) {
    if (isFalsy) {
        return await runStatements(execution, block.statements);
    }
    if (Array.isArray(block.elseStatements)) {
        return await runStatements(execution, block.elseStatements);
    }
    return null;
}
```

### Patch B — Push truthy scalars

Replace the final `return await runStatements(execution, block.statements);` with:

```ts
execution.pushContext(value);
const result = await runStatements(execution, block.statements);
execution.popContext();
return result;
```

This is the same change recommended in
[implicit-iterator.md](implicit-iterator.md) — pick one place to land
it.

### Patch C — Verify parent-context lookup

Read `src/runner/path-expression.ts` carefully against the `Parent
contexts`, `List Contexts`, and `Deeply Nested Contexts` failing data.
The fix may be:

- The path resolver short-circuits to the current frame instead of walking up when the *first* segment is missing.
- Or it walks correctly but the segment matcher returns `undefined` vs `null` inconsistently, causing later segments to fail.

This is investigation, not a pre-specced patch. Run the failing test
under a debugger to confirm.

### Patch D — `Doubled` (both files)

Wait until [standalone-line-whitespace.md](standalone-line-whitespace.md) is implemented, then re-run.

### AST / version

No AST change. No `VERSION` bump.

### Files to touch

- `src/runner/block.ts` — Patches A and B.
- `src/runner/path-expression.ts` — Patch C (if confirmed).

## Effort & risk

- **Small.** Patches A and B are ~5 lines each. Patch C is investigative
  but likely small once the cause is found.
- Risk: medium. Patch B in particular changes behavior for any existing
  Bigodon template that uses `{{#scalar}}…{{/scalar}}`. Run all of
  `npm test` and confirm `test/runner/block.spec.js` still passes.

## Won't-fix rationale

None — these are conformance bugs against a feature Bigodon already
claims to support. Worth fixing.
