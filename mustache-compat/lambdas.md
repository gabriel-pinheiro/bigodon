# Lambdas (optional)

## Summary

Mustache lambdas are *optional* per-language extensions where the
template data contains a function. The spec defines two distinct
behaviors:

- **Interpolation lambda** (`{{lambda}}`): the function is called with
  no arguments; its **return value is re-parsed as a Mustache template
  with the current context** and the result substituted. Calls are
  cached per-template-position.
- **Section lambda** (`{{#lambda}}…{{/lambda}}`): the function is
  called with the **raw (unrendered) section body** as a string
  argument; its return value is rendered as a template. Calls are
  *not* cached.

Bigodon does have a function-call mechanism (helpers, registered via
`addHelper`), but its semantics differ from Mustache lambdas in two
material ways:

1. Helper return values are emitted as-is, not re-parsed.
2. Block helpers (`{{#helper …}}…{{/helper}}`) receive a structured
   call interface, not the raw template string.

So the spec tests fail not because Bigodon can't run user code in
templates, but because its model is "helpers," not "lambdas."

## Failing specs (10)

From `~lambdas.json`:

- `Interpolation`
- `Interpolation - Expansion`
- `Interpolation - Alternate Delimiters` (also blocked by [set-delimiters](set-delimiters.md))
- `Interpolation - Multiple Calls`
- `Escaping` (also blocked by [triple/ampersand](triple-mustache-and-ampersand.md))
- `Section`
- `Section - Expansion`
- `Section - Alternate Delimiters` (also blocked by set-delimiters)
- `Section - Multiple Calls`
- `Inverted Section`

## Why it fails today

The spec runner in `test/spec.spec.js:44-47` evaluates each lambda's
`js` source via `eval` and assigns it to `data.lambda`. Bigodon then
tries to compile and run the template. Two failure modes:

- For interpolation: `{{lambda}}` resolves the path `lambda` to the
  function value. Bigodon then *does not* call the function — it
  stringifies it (likely to `"function() { return \"world\" }"` or
  similar). Even if it did call it, the spec wants the return value
  *re-parsed*, which Bigodon's runtime does not do.
- For section: `{{#lambda}}…{{/lambda}}` enters `runBlock`
  (`src/runner/block.ts`) with `value` being a function, which is
  truthy and not an array/object, so it renders the body once with the
  function still on top of the context — definitely not the spec
  semantics.

Bigodon's helpers (`src/runner/helper.ts`) are looked up in
`execution.extraHelpers` and the bundled defaults, **not** in the
`context` itself. So even if the user wraps the lambda as a helper,
the call shape (positional arguments parsed by the template) doesn't
match the spec's "raw body in, rendered template out."

## Proposed implementation

This is a **design choice**, not just a feature add. Three options:

### Option 1 — Recognize callable context values as lambdas (recommended for compatibility)

In `src/runner/path-expression.ts` (or wherever the resolved value is
returned to the consumer), if the resolved value is a function:

- For `MUSTACHE` / interpolation: call the function with no args; if
  the return is a string, **re-parse and re-run** it against the
  current execution. The re-parse step requires invoking the parser
  reentrantly — feasible but expensive. Cache parsed ASTs by the
  function's source if performance matters; the spec's "Multiple
  Calls" test specifically asserts caching.
- For block (`runBlock` in `src/runner/block.ts`): if `value` is a
  function, capture the *raw template substring* covered by the block
  body (using `block.statements[0].loc.start` and
  `block.statements[block.statements.length - 1].loc.end`, plus the
  source string). Call the function with that raw string. Re-parse and
  re-run the return. Per spec, do **not** cache.

The raw-substring extraction means the runner needs access to the
**original template source**, which it doesn't have today. Plumb the
source string through `compile` → the closure returned by `compile`
captures `source`, and the AST root already has `loc` on every node →
the runner can ask `Execution` for `source.slice(start, end)`.

### Option 2 — Map helpers to lambdas

Provide an opt-in: when a helper returns a string and a flag (e.g.,
`{ template: true }`) is set, re-parse it. This handles the
interpolation case but doesn't solve "section receives raw body."

### Option 3 — Skip

Lambdas are optional; Bigodon's helper API is the documented way to
inject computed values. Add `'~lambdas.json'` to `SKIPPED_SPECS` in
`test/spec.spec.js`.

### Files to touch (Option 1)

- `src/runner/execution.ts` — add `source: string` field.
- `src/runner/index.ts` — pass `source` through; in the `MUSTACHE` case, detect callable values and re-parse their return.
- `src/runner/block.ts` — detect callable values and execute the raw-body lambda flow.
- `src/parser/index.ts` — `parse()` should now also expose the parsed source (no AST change; just a sibling export from `compile()`).
- `src/index.ts` — thread the source through to the runner.
- `LANGUAGE.md`, `LIB.md` — document lambda semantics if implemented.

No AST shape change; no `VERSION` bump.

### Security

- Lambdas execute caller-supplied JavaScript. This is **caller-controlled** code, not template-author code, so it doesn't violate Bigodon's "safe to run user templates" claim — but worth a docs note that lambda support means the template's *data* can run arbitrary JS, narrowing the trust boundary.
- The re-parse step parses a string the lambda chose. If the lambda is itself derived from untrusted input, that string could be a hostile template. Re-running it through Bigodon's safe interpreter is fine in principle, but `maxExecutionMillis` must wrap the re-run.

## Effort & risk

- Option 1: **Large.** ~2 days. Source-plumbing and re-entrant parsing are the bulk of the work; per-call caching adds nuance.
- Option 2: **Small.** Half a day; partial coverage.
- Option 3: **Trivial.** Add a string to `SKIPPED_SPECS`.
- Risk: medium for Option 1 — re-entrant parser usage is something the
  parser combinator stack can support but hasn't been stress-tested.

## Won't-fix rationale

Strong candidate for "won't fix." Bigodon's helper API is its
deliberate alternative to lambdas, and the security/perf cost of
re-parsing inside the runtime cuts against Bigodon's "safely interpret
user templates" framing. Recommended: document the divergence and
point users at `addHelper` for the same use cases.
