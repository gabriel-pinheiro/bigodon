# Bigodon
Secure Handlebars/Mustache templating for user-provided templates with async helpers support and human-friendly parsing errors.


## Features

As well as most Handlebars features like:
- Handlebars dot notation inside mustaches (`{{foo.bar}}`)
- Handlebars literal values (`{{helper 5 6}}`)
- Comments (`{{! ... }}`)
- Nested expressions (`{{outer (inner data.firstName data.secondName)}}`)
- Blocks (`{{#name}}...{{/name}}`)
- Inverted blocks (`{{^name}}...{{/name}}`)
- Else blocks (`{{#name}}...{{else}}...{{/name}}`)
- Parent and current context (`{{#list}}{{$parent.name}} {{$this}}{{/list}}`)

Bigodon also supports:
- Async helpers, you can await for requests, database access, file access and so on.
- Safely evaluate user-provided templates. (Templates aren't transpiled to JavaScript, they're interpreted by Bigodon)
- Much better performance.
- Better error reporting.
- Minimal core: only the block primitives (`if`, `unless`, `with`, `each`, `return`) ship by default. Register your own utilities with `addHelper`.

Bigodon is used in production by [Mocko](https://mocko.dev/).

## Installation

Add the `bigodon` dependency to your project. Types included:
```shell
npm install bigodon
```

## Usage

```javascript
const { compile } = require('bigodon');

async function main() {
    const source = 'Hello, {{name}}!';
    const template = compile(source);

    const result = await template({
        name: 'George'
    });

    console.log(result); // Hello, George!
}

main().catch(console.error);
```

Or, if you want to split parsing from execution between services or cache the parsed AST:
```javascript
const { parse, run } = require('bigodon');

const source = 'Hello, {{name}}!';
const ast = parse(source); // This will return a JSON object that can be persisted for later usage


// In another process or later:
async function main() {
    const result = await run(ast, {
        name: 'George'
    });

    console.log(result); // Hello, George!
}
main().catch(console.error);
```

## Check how to use the lib [here](LIB.md)
## Check how to use the language [here](LANGUAGE.md)

## Check the available helpers [here](HELPERS.md)

## Mustache spec compatibility

Bigodon is a Handlebars-flavored superset and is **not** a drop-in Mustache
implementation. Against the official [mustache/spec](https://github.com/mustache/spec)
suite, **103 / 110** attempted tests currently pass (94%); the remaining 84
spec tests live in 5 deliberately-skipped feature files (partials, dynamic-names,
set-delimiters, inheritance, lambdas) and 4 individual tests are skipped because
they require auto-walking the context stack — Bigodon uses Handlebars-style
strict scoping (use `$parent`/`$root` to walk up explicitly).

Detailed per-feature breakdowns — including failing test names, root-cause
analysis, and proposed implementations — live in
[`mustache-compat/`](mustache-compat/README.md).

| Feature                                  | Status        | Notes |
| ---------------------------------------- | ------------- | ----- |
| Variable interpolation `{{x}}`           | Supported     | Output is **never HTML-escaped** by default — register an escape helper if needed |
| Sections `{{#x}}…{{/x}}`                 | Supported     | Empty arrays falsy on negated branch; truthy scalars do **not** push as context (Handlebars-style); use `$parent`/`$root` to walk the context stack |
| Inverted sections `{{^x}}…{{/x}}`        | Supported     | Empty arrays correctly treated as falsy |
| Comments `{{! … }}`                      | Supported     | Standalone-line whitespace is stripped |
| Triple mustache `{{{x}}}`                | Supported     | Output is identical to `{{x}}` (Bigodon never HTML-escapes by default) |
| Ampersand `{{&x}}`                       | Supported     | Output is identical to `{{x}}` |
| Standalone-line whitespace stripping     | Supported     | Applied to comments and section open/close tags — see [standalone-line-whitespace.md](mustache-compat/standalone-line-whitespace.md) |
| Implicit iterator `{{.}}`                | Supported     | Resolves to current context (alias of `{{$this}}`) — see [implicit-iterator.md](mustache-compat/implicit-iterator.md) |
| Block heads with literal-named keys      | Supported     | `{{#null}}` / `{{#true}}` / `{{#false}}` / `{{#undefined}}` look up the matching key in context |
| HTML Escaping for `{{x}}`                | Not supported | Bigodon emits raw output; register an escape helper if needed |
| Auto context-stack walk on missing keys  | Not supported | Bigodon uses strict scoping — use `$parent`/`$root` to walk explicitly |
| Set Delimiters `{{=<% %>=}}`             | Not planned   | See [set-delimiters.md](mustache-compat/set-delimiters.md) |
| Partials `{{>name}}`                     | Not planned   | See [partials.md](mustache-compat/partials.md) |
| Dynamic names `{{*name}}` (optional)     | Not planned   | Depends on partials — see [dynamic-names.md](mustache-compat/dynamic-names.md) |
| Inheritance `{{<p}}{{$b}}…` (optional)   | Not planned   | `$` collides with Bigodon's variable syntax — see [inheritance.md](mustache-compat/inheritance.md) |
| Lambdas (optional)                       | Not supported | Bigodon's helper API (`addHelper`) is the recommended alternative — see [lambdas.md](mustache-compat/lambdas.md) |

Run `npm run test:spec` to execute the full Mustache spec suite locally
(it clones [mustache/spec](https://github.com/mustache/spec) into
`test/mustache/` on first run).
