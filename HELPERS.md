# Bigodon Helpers

Bigodon ships only the **block primitives** wired to template syntax. Anything else (string, math, date, array utilities, comparisons, etc.) was removed in 3.0.0 — register your own with `bigodon.addHelper(name, fn)`. See [LIB.md](./LIB.md) for the API and [LANGUAGE.md](./LANGUAGE.md) for syntax.

| Helper   | Purpose                                                                               |
|----------|---------------------------------------------------------------------------------------|
| [`if`](#if)         | Run a block when the value is truthy. Does not change context.             |
| [`unless`](#unless) | Run a block when the value is falsy. Does not change context.              |
| [`with`](#with)     | Run a block once with the value as the new context.                        |
| [`each`](#each)     | Iterate a block over an array (or once over a non-array).                  |
| [`return`](#return) | Halt the execution; the template returns what has been rendered so far.    |

---

## `if`

```handlebars
{{#if user.active}}
    Welcome, {{user.name}}!
{{else}}
    Account inactive.
{{/if}}
```

Coerces the argument to a boolean. The body runs when truthy; an optional `{{else}}` branch runs when falsy. Context is not changed inside the block.

## `unless`

```handlebars
{{#unless user.banned}}
    Hello, {{user.name}}.
{{else}}
    Access denied.
{{/unless}}
```

Inverse of `if`. The body runs when the argument is falsy.

## `with`

```handlebars
{{#with user.address}}
    {{street}}, {{city}}
{{/with}}
```

Pushes the argument as the current context for the duration of the block. Inside, `{{this}}` and bare paths resolve against the new context. The block runs exactly once. Falsy values render nothing.

## `each`

```handlebars
{{#each items}}
    - {{this}}
{{/each}}
```

Iterates over an array, pushing each element as the current context. A non-array argument is treated as a single-element list (the block runs once with that value as context). Empty arrays render nothing.

## `return`

```handlebars
Hello{{#if shouldStop}}{{return}}{{/if}}, world!
```

Halts the rest of the template. The runner returns whatever output has accumulated up to that point.

---

## Adding your own helpers

```js
const { default: Bigodon } = require('bigodon');

const bigodon = new Bigodon();
bigodon.addHelper('upper', s => String(s).toUpperCase());
bigodon.addHelper('add', (a, b) => Number(a) + Number(b));

const templ = bigodon.compile('Hello, {{upper name}}! You have {{add count 1}} messages.');
await templ({ name: 'ana', count: 4 }); // "Hello, ANA! You have 5 messages."
```

Helpers receive the `Execution` instance as `this` (use `this.data` for side-channel state, `this.halt()` to stop execution). Helpers can be `async`.

> **Note on the module-level helpers** — the convenience exports `compile`, `parse`, `run` etc. on the default singleton do not carry user-registered helpers. Use `new Bigodon()` whenever you need custom helpers.
