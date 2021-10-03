# Bigodon Language Reference

Bigodon is a templating language that allows you to create **templates** that will generate an **output** when given a **context**. A context is a JSON-like object that can contain numbers, strings, booleans, arrays, objects.

You can access fields from the context in your template:

## Path expressions

Path expressions are mustaches (between `{{` and `}}`) that allow you to access fields from the context, here's an example:

```hbs
Hello, {{ name }}!
```

<details>
<summary>Context and output</summary>

### Context
```json
{
    "name": "George"
}
```

### Generated output
```
Hello, George!
```

</details>

---

Path expressions can access nested objects with dot notation:

```hbs
Hey {{ name.first }} {{ name.last }}!
```

<details>
<summary>Context and output</summary>

### Context
```json
{
    "name": {
        "first": "George",
        "last": "Smith"
    }
}
```

### Generated output
```
Hey George Smith!
```

</details>

---

## Comments

Comments are written between `{{!` and `}}`:

```hbs
{{! greeting the user }}
Hello, {{ name }} :)
```

<details>
<summary>Context and output</summary>

### Context
```json
{
    "name": "George"
}
```

### Generated output
```

Hello, George :)
```
</details>

---

## Helpers

Helpers are functions that can be called from within your templates. You can find **all the available helpers in [here](HELPERS.md)** and new helpers can also be defined [like this](LIB.md#helpers). Here's an example:

```hbs
Hello, {{capitalize name }}!
```

<details>
<summary>Context and output</summary>

### Context
```json
{
    "name": "george"
}
```

### Generated output
```
Hello, George!
```

</details>

Note that spaces are optional inside mustaches, `{{name}}` is the same as `{{ name }}`; `{{upper name }}` is the same as `{{ upper name }}` or `{{upper name}}`.

---

You can pass multiple arguments to helpers separated by spaces:

```hbs
Hello, {{default name "stranger"}}!
```

<details>
<summary>Context and output</summary>

With context `{"name": "George"}` the output would be:
```
Hello, George!
```

With context `{}` the output would be:
```
Hello, stranger!
```

</details>

---

Expressions can be nested with parentheses, you can pass the return of a helper as a parameter to another one:

```hbs
Hello, {{default (capitalize name) "stranger"}}!
```

<details>
<summary>Context and output</summary>

With context `{"name": "george"}` the output would be:
```
Hello, George!
```

With context `{}` the output would be:
```
Hello, stranger!
```

</details>

---

## Conditional Blocks

You can use blocks for conditionals. Blocks are written between `{{#` and `}}` and closed with `{{/` and `}}`, when given a truthy value they are executed, when given a falsy value they are ignored:

```hbs
{{#name}}
Hello, {{ name }}!
{{/name}}
Welcome to our website :)
```

<details>
<summary>Context and output</summary>

With context `{"name": "George"}` the output would be:
```
Hello, George!
Welcome to our website :)
```

With context `{}` or `{"name": null}` the output would be:
```
Welcome to our website :)
```

</details>

Note that, for blocks, you cannot have a space between the opening mustache and the `#`.

---

Blocks can have an else section, which is executed when the block is not truthy:

```hbs
{{#name}}
Hello, {{ name }}!
{{else}}
Hello, Stranger!
{{/name}}
```

<details>
<summary>Context and output</summary>

With context `{"name": "George"}` the output would be:
```
Hello, George!
```

With context `{}` or `{"name": null}` the output would be:
```
Hello, Stranger!
```

</details>

---

You can also use helpers in blocks:

```hbs
{{#eq (typeof name) "string"}}
Hello, {{capitalize name }}!
{{else}}
Invalid name
{{/eq}}
```

<details>
<summary>Context and output</summary>

With context `{"name": "george"}` the output would be:
```
Hello, George!
```

With context `{"name": 5}` the output would be:
```
Invalid name
```

</details>

---

## Loop Blocks

You can also use blocks for loops. When given an array, the block will be executed for each element in the array. The context inside the block is changed to the item of the array:

```hbs
{{name}}, you got {{length comments }} comments:

{{#comments}}
    {{author}} wrote:
    {{comment}}
{{/comments}}
```

<details>
<summary>Context and output</summary>

### Context
```json
{
    "name": "George",
    "comments": [{
        "author": "Alice",
        "comment": "Nice presentation"
    }, {
        "author": "Bob",
        "comment": "Thanks for the feedbacks"
    }]
}
```

### Generated output
```
George, you got 2 comments:


    Alice wrote:
    Nice presentation

    Bob wrote:
    Thanks for the feedbacks
```

</details>

---

You can use the current item of the loop with `$this`:

```hbs
{{#keywords}}
- {{ $this }}
{{/keywords}}
```

<details>
<summary>Context and output</summary>

### Context
```json
{
    "keywords": ["lorem", "ipsum", "dolor"]
}
```

### Generated output
```
- lorem
- ipsum
- dolor
```

</details>

---

You can use `$parent` to point to the parent context (you can use multiple parents like `$parent.$parent.foo`) and `$root` to point to the main context:

```hbs
{{name}}, you got {{length comments }} comments:

{{#comments}}
    From {{author}} to {{$parent.name}}:
    {{comment}}
{{/comments}}
```

<details>
<summary>Context and output</summary>

### Context
```json
{
    "name": "George",
    "comments": [{
        "author": "Alice",
        "comment": "Nice presentation"
    }, {
        "author": "Bob",
        "comment": "Thanks for the feedbacks"
    }]
}
```

### Generated output
```
George, you got 2 comments:


    From Alice to George:
    Nice presentation

    From Bob to George:
    Thanks for the feedbacks
```

</details>

---

## Negated blocks

You can use negated blocks for conditionals only. Replace `#` by `^` like so:

```hbs
{{^name}}
You are not logged in
{{/name}}
```

---

## Context Blocks

When given an object, a block will be rendered with it as the context:

```hbs
{{#parent}}
Hello, {{ name }}!
{{/parent}}
```

<details>
<summary>Context and output</summary>

### Context
```json
{
    "name": "George",
    "parent": {
        "name": "Alice"
    }
}
```

### Generated output
```
Hello, Alice!
```

</details>

---

You can use the `if` helper to prevent that from happening:

```hbs
{{#if parent}}
Hello, {{ name }}!
{{/if}}
```

<details>
<summary>Context and output</summary>

### Context
```json
{
    "name": "George",
    "parent": {
        "name": "Alice"
    }
}
```

### Generated output
```
Hello, George!
```

</details>

---

You can use the `with` helper to force an item as context even if it's not an object:

```hbs
{{#with parent}}
Hello, {{ $this }}!
{{/with}}
```
<details>
<summary>Context and output</summary>

### Context
```json
{
    "name": "George",
    "parent": 5
}
```

### Generated output
```
Hello, 5!
```

</details>

---

