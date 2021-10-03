# Bigodon Helpers

When writing your Bigodon template, you can use helper functions to perform common tasks. These are the categories of helpers:

- [array](#Array-Helpers) ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/array.ts); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/array-helpers.spec.js))
- [comparison](#Comparison-Helpers) ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/comparison.ts); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/comparison-helpers.spec.js))
- [string](#String-Helpers) ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/string.ts); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/string-helpers.spec.js))

## Array Helpers

- [each](#each): Iterates over each item of an array. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/array.ts#L89-L95); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/array-helpers.spec.js#L225-L236))
- [forEach](#forEach): Iterates over each item of an array with some context (isFirst, isLast, index, total). ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/array.ts#L97-L110); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/array-helpers.spec.js#L237-L258))
- [itemAt](#itemAt): Returns the item at the given index. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/array.ts#L19-L28); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/array-helpers.spec.js#L48-L75))
- [first](#first): Returns the first item of an array. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/array.ts#L3-L9); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/array-helpers.spec.js#L12-L28))
- [last](#last): Returns the last item of an array. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/array.ts#L11-L17); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/array-helpers.spec.js#L30-L46))
- [length](#length): Returns the length of an array. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/array.ts#L30-L36); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/array-helpers.spec.js#L77-L97))
- [slice](#slice): Returns a slice of an array. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/array.ts#L60-L71); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/array-helpers.spec.js#L143-L174))
- [after](#after): Returns the items after the given index. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/array.ts#L38-L47); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/array-helpers.spec.js#L99-L124))
- [before](#before): Returns the items before the given index. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/array.ts#L49-L58); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/array-helpers.spec.js#L126-L141))
- [includes](#includes): Returns true if the given item is in the array. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/array.ts#L73-L83); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/array-helpers.spec.js#L176-L210))
- [contains](#contains): Alias of [includes](#includes).
- [isArray](#isArray): Returns true if the given item is an array. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/array.ts#L85-L87); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/array-helpers.spec.js#L212-L223))
- [join](#join): Joins an array of items into a string with a separator. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/array.ts#L112-L118); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/array-helpers.spec.js#L260-L279))
- [merge](#merge): Merges multiple arrays into one. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/array.ts#L120-L128); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/array-helpers.spec.js#L281-L293))
- [reverse](#reverse): Reverses an array. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/array.ts#L130-L140); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/array-helpers.spec.js#L295-L314))
- [pluck](#pluck): Returns an array of the given property from each item in the original one. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/array.ts#L142-L154); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/array-helpers.spec.js#L316-L336))
- [unique](#unique): Returns an array of unique items from the original one. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/array.ts#L156-L162); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/array-helpers.spec.js#L338-L352))

From [string helpers](#String-Helpers):
- [split](#split): Splits a string into an array of strings on each separator. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/string.ts#L6); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/string-helpers.spec.js#L89-L95))

## Comparison Helpers

- [if](#if): Runs a block if the parameter is truthy without changing context. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/comparison.ts#L10); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/comparison-helpers.spec.js#L166-L182))
- [unless](#unless): Runs a block if the parameter is falsy without changing context. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/comparison.ts#L11); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/comparison-helpers.spec.js#L184-L190))
- [and](#and): Returns true if all arguments are truthy. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/comparison.ts#L1); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/comparison-helpers.spec.js#L39-L64))
- [or](#or): Returns true if any argument is truthy. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/comparison.ts#L2); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/comparison-helpers.spec.js#L66-L91))
- [not](#not): Returns true if the argument is falsy. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/comparison.ts#L3); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/comparison-helpers.spec.js#L93-L99))
- [eq](#eq): Returns true if the arguments are strictly equal (===). ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/comparison.ts#L4); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/comparison-helpers.spec.js#L11-L23))
- [is](#is): Returns true if the arguments are loosely equal (==). ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/comparison.ts#L5); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/comparison-helpers.spec.js#L25-L37))
- [gt](#gt): Returns true if the first argument is greater than the second. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/comparison.ts#L6); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/comparison-helpers.spec.js#L101-L115))
- [gte](#gte): Returns true if the first argument is greater than or equal to the second. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/comparison.ts#L7); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/comparison-helpers.spec.js#L117-L131))
- [lt](#lt): Returns true if the first argument is less than the second. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/comparison.ts#L8); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/comparison-helpers.spec.js#L133-L148))
- [lte](#lte): Returns true if the first argument is less than or equal to the second. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/comparison.ts#L9); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/comparison-helpers.spec.js#L150-L164))
- [typeof](#typeof): Returns the type of the argument. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/comparison.ts#L12); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/comparison-helpers.spec.js#L192-L201))
- [default](#default): Returns the first argument that is not undefined or null. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/comparison.ts#L13); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/comparison-helpers.spec.js#L203-L228))
- [coalesce](#coalesce): Alias of [default](#default).
- [firstNonNull](#firstNonNull): Alias of [default](#default).

From [array helpers](#Array-Helpers):
- [includes](#includes): Returns true if the given item is in the array or if a substring is in a string. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/array.ts#L73-L83); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/array-helpers.spec.js#L176-L210))
- [contains](#contains): Alias of [includes](#includes).
- [isArray](#isArray): Returns true if the given item is an array. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/array.ts#L85-L87); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/array-helpers.spec.js#L212-L223))

From [string helpers](#String-Helpers):
- [startsWith](#startsWith): Returns true if the string starts with the given value. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/string.ts#L7); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/string-helpers.spec.js#L97-L127))
- [endsWith](#endsWith): Returns true if the string ends with the given value. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/string.ts#L8); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/string-helpers.spec.js#L129-L159))


## String Helpers

- [append](#append): Appends several strings into one. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/string.ts#L3); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/string-helpers.spec.js#L11-L29))
- [uppercase](#uppercase): Returns the string in uppercase. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/string.ts#L4); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/string-helpers.spec.js#L31-L55))
- [upper](#upper): Alias of [uppercase](#uppercase).
- [upcase](#upcase): Alias of [uppercase](#uppercase).
- [lowercase](#lowercase): Returns the string in lowercase. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/string.ts#L5); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/string-helpers.spec.js#L57-L87))
- [lower](#lower): Alias of [lowercase](#lowercase).
- [lowcase](#lowcase): Alias of [lowercase](#lowercase).
- [downcase](#downcase): Alias of [lowercase](#lowercase).
- [down](#down): Alias of [lowercase](#lowercase).
- [capitalize](#capitalize): Capitalizes the first letter of the string. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/string.ts#L15-L18); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/string-helpers.spec.js#L223-L241))
- [capitalizeFirst](#capitalizeFirst): Alias of [capitalize](#capitalize).
- [capitalizeAll](#capitalizeAll): Capitalizes the first letter of each word in a string. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/string.ts#L19-L22); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/string-helpers.spec.js#L243-L261))
- [capitalizeWords](#capitalizeWords): Alias of [capitalizeAll](#capitalizeAll).
- [startsWith](#startsWith): Returns true if the string starts with the given value. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/string.ts#L7); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/string-helpers.spec.js#L97-L127))
- [endsWith](#endsWith): Returns true if the string ends with the given value. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/string.ts#L8); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/string-helpers.spec.js#L129-L159))
- [toString](#toString): Returns the string representation of the given value. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/string.ts#L12); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/string-helpers.spec.js#L215-L221))
- [split](#split): Splits a string into an array of strings on each separator. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/string.ts#L6); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/string-helpers.spec.js#L89-L95))
- [replace](#replace): Replaces all occurrences of the given value with the given replacement. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/string.ts#L13); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/string-helpers.spec.js#L263-L281))
- [substring](#substring): Returns a substring of the given string. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/string.ts#L23-L27); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/string-helpers.spec.js#L283-L301))
- [trim](#trim): Removes whitespace around a string. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/string.ts#L9); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/string-helpers.spec.js#L161-L173))
- [trimLeft](#trimLeft): Removes whitespace from the left side of a string. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/string.ts#L10); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/string-helpers.spec.js#L175-L193))
- [trimStart](#trimStart): Alias of [trimLeft](#trimLeft).
- [trimRight](#trimRight): Removes whitespace from the right side of a string. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/string.ts#L11); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/string-helpers.spec.js#L195-L213))
- [trimEnd](#trimEnd): Alias of [trimRight](#trimRight).
- [padRight](#padRight): Pads the string with the given value to the right until it reaches the given length. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/string.ts#L35-L41); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/string-helpers.spec.js#L329-L353))
- [padEnd](#padEnd): Alias of [padRight](#padRight).
- [padLeft](#padLeft): Pads the string with the given value to the left until it reaches the given length. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/string.ts#L28-L34); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/string-helpers.spec.js#L303-L327))
- [padStart](#padStart): Alias of [padLeft](#padLeft).

From [array helpers](#Array-Helpers):
- [length](#length): Returns the length of a string. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/array.ts#L30-L36); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/array-helpers.spec.js#L77-L97))
- [includes](#includes): Returns true if the given substring is in the string. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/array.ts#L73-L83); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/array-helpers.spec.js#L176-L210))
- [contains](#contains): Alias of [includes](#includes).
- [reverse](#reverse): Reverses a string. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/array.ts#L130-L140); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/array-helpers.spec.js#L295-L314))
- [join](#join): Joins an array of items into a string with a separator. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/array.ts#L112-L118); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/array-helpers.spec.js#L260-L279))

From [comparison helpers](#Comparison-Helpers):
- [typeof](#typeof): Returns the type of the argument. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/comparison.ts#L12); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/comparison-helpers.spec.js#L192-L201))
- [default](#default): Returns the first argument that is not undefined or null. ([code](https://github.com/gabriel-pinheiro/bigodon/blob/main/src/runner/helpers/comparison.ts#L13); [tests](https://github.com/gabriel-pinheiro/bigodon/blob/main/test/comparison-helpers.spec.js#L203-L228))
- [coalesce](#coalesce): Alias of [default](#default).
- [firstNonNull](#firstNonNull): Alias of [default](#default).

## Examples

### **each**

`each` runs a block N times for the given array items as context. If provided with a non-array, it runs the block once with it as context.

#### Examples:

```mustache
Keywords:
{{#each keywords}}
- {{ $this }}
{{/each}}
```

<details>
<summary>Context and output</summary>

With context `{"keywords": ["lorem", "ipsum", "dolor"]}` the output would be:
```
Keywords:
- lorem
- ipsum
- dolor
```

With context `{"keywords": "foo"}` the output would be:
```
Keywords:
- lorem
```

With context `{"keywords": []}` the output would be:
```
Keywords:
```

With context `{"keywords": null}` the output would be:
```
Keywords:
- null
```

</details>

```mustache
{{name}}, you got {{length comments }} comments:

{{#each comments}}
    From {{author}} to {{$parent.name}}:
    {{comment}}
{{/each}}
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

### **forEach**

`forEach` runs a block N times with information about the current item as context. The context will have:
- `item`: The current item.
- `index`: The current index.
- `total`: The length of the array.
- `isFirst`: True if the current item is the first one.
- `isLast`: True if the current item is the last one.

#### Example:
```mustache
{{#forEach items}}
    {{index}}: {{item}}{{^isLast}};{{else}}.{{/isLast}}
{{/forEach}}
```

<details>
<summary>Context and output</summary>

### Context
```json
{
    "items": ["potato", "carrot", "onion"]
}
```

### Generated output
```
0: potato;
1: carrot;
2: onion.
```

</details>

---

### **or**

`or` returns true if any of the given arguments are truthy.

#### Example:
```mustache
{{#or (eq food "apple") (eq food "banana") (eq food "orange")}}
    {{upper food}} is a fruit.
{{else}}
    {{upper food}} is not a fruit.
{{/or}}
```
<details>
<summary>Context and output</summary>

### Context
```json
{
    "food": "banana"
}
```

### Generated output
```
BANANA is a fruit
```

</details>

---
