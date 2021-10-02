# Bigodon
Secure Handlebars (Mustache) templating for user-provided templates with async helpers support and human-friendly parsing errors.

### ⚠️ This is a work in progress.

## Features
- [x] Handlebars dot notation inside mustaches (`{{foo.bar}}`)
- [x] Handlebars literal values (`{{add 5 6}}`)
- [x] Safely evaluate user-provided templates. (Templates aren't transpiled to JavaScript, they're interpreted by bigodon)
- [x] Comments (`{{! ... }}`)
- [x] Nested expressions (`{{capitalize (append data.firstName data.secondName)}}`)
- [x] Async helpers
- [x] Blocks (`{{#name}}...{{/name}}`)
- [x] Inverted blocks (`{{^name}}...{{/name}}`)
- [x] Else blocks (`{{#name}}...{{else}}...{{/name}}`)
- [x] Parent and current context (`{{#list}}{{$parent.name}} {{$this}}{{/list}}`)
- [ ] String with simple quotes
- [ ] Parameterless helpers (`{{uuid}}`)
- [ ] Nested blocks (`{{#eq foo 1}}...{{else eq foo 2}}...{{else}}...{{/eq}}`)
- [ ] Documentation

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
