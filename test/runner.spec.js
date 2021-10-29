const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { compile, compileExpression, run, default: Bigodon } = require('../dist');
const { VERSION } = require('../dist/parser/index');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('runner', () => {
    it('should not run unsupported versions', async () => {
        await expect(run({
            type: 'TEMPLATE',
            version: -1,
            statements: [],
        })).to.reject();

        await expect(run({
            type: 'TEMPLATE',
            version: 1e9,
            statements: [],
        })).to.reject();
    });

    it('should return text statements', async () => {
        const templ = compile('Lorem ipsum');
        expect(await templ()).to.equal('Lorem ipsum');
    });

    it('should ignore comments', async () => {
        const templ = compile('Lorem {{! ipsum }} dolor');
        expect(await templ()).to.equal('Lorem  dolor');
    });

    describe('mustache', () => {
        it('should return literal path expressions', async () => {
            const templ = compile('Hello, {{ "George" }}!');
            expect(await templ()).to.equal('Hello, George!');
        });

        it('should return simple path expressions', async () => {
            const templ = compile('Hello, {{ name }}!');
            expect(await templ({ name: 'George' })).to.equal('Hello, George!');
            expect(await templ()).to.equal('Hello, !');
            expect(await templ({})).to.equal('Hello, !');
            expect(await templ({ name: null })).to.equal('Hello, !');
            expect(await templ({ name: 5 })).to.equal('Hello, 5!');
            expect(await templ({ name: false })).to.equal('Hello, false!');
        });

        it('should return deep path expressions', async () => {
            const templ = compile('Hello, {{ name.first }} {{ name.last }}!');
            expect(await templ({ name: { first: 'George', last: 'Schmidt' } })).to.equal('Hello, George Schmidt!');
            expect(await templ()).to.equal('Hello,  !');
            expect(await templ({})).to.equal('Hello,  !');
            expect(await templ({ name: null })).to.equal('Hello,  !');
            expect(await templ({ name: 5 })).to.equal('Hello,  !');
            expect(await templ({ name: false })).to.equal('Hello,  !');
        });

        it('should allow $this for helper-path disambiguisation', async () => {
            const bigodon = new Bigodon();
            bigodon.addHelper('foo', () => 'wrong');
            const templ = bigodon.compile('{{ $this.foo }} {{ $this.obj.deep }}');
            expect(await templ({ foo: 'bar', obj: { deep: 'baz' } })).to.equal('bar baz');
        });

        it('should return context values converted to string', async () => {
            const templ = compile('{{ obj }} {{ arr }} {{ str }} {{ num }} {{ bTrue }} {{ bFalse }} {{ nil }} {{ undef }}');
            expect(await templ({
                obj: {},
                arr: [],
                str: 'foo',
                num: 0,
                bTrue: true,
                bFalse: false,
                nil: null,
                undef: void 0,
            })).to.equal('[object Object] [object Array] foo 0 true false  ');
        });

        it('should ignore unsafe keys', async () => {
            const templ = compile('Hello, {{ name.constructor }} {{ name.__proto__ }}!');
            expect(await templ({ name: {
                __proto__: 'foo',
                constructor: 'bar',
            } })).to.equal('Hello,  !');
        });

        it('should not return Object prototype keys', async () => {
            const templ = compile('{{ hasOwnProperty }}{{ obj.toString }}{{ obj.hasOwnProperty }}');
            expect(await templ({ obj: {} })).to.equal('');
        });

        it('should not return Array prototype keys', async () => {
            const templ = compile('{{ arr.length }}{{ arr.toString }}');
            expect(await templ({ arr: [] })).to.equal('');
        });

        it('should not return String prototype keys', async () => {
            const templ = compile('{{ str.length }}{{ str.toString }}');
            expect(await templ({ str: 'yada' })).to.equal('');
        });

        it('should not return Number prototype keys', async () => {
            const templ = compile('{{ num.toString }}{{ num.toFixed }}');
            expect(await templ({ num: 1 })).to.equal('');
        });

        it('should ignore unknown statements', async () => {
            const result = await run({
                type: 'TEMPLATE',
                version: VERSION,
                statements: [{
                    type: 'TEXT',
                    value: 'foo',
                }, {
                    type: 'ABLUEBLUE',
                    value: 'noope',
                }, {
                    type: 'TEXT',
                    value: 'bar',
                }]
            });

            expect(result).to.equal('foobar');
        });
    });

    describe('blocks', () => {
        it('should return statements with truthy value', async () => {
            const templ = compile('{{#val}}foo{{/val}}');
            expect(await templ({ val: true })).to.equal('foo');
            expect(await templ({ val: 'a' })).to.equal('foo');
            expect(await templ({ val: {} })).to.equal('foo');
            expect(await templ({ val: 1 })).to.equal('foo');
        });

        it('should ignore statements with falsy value', async () => {
            const templ = compile('{{#val}}foo{{/val}}');
            expect(await templ({ val: false })).to.equal('');
            expect(await templ({ val: null })).to.equal('');
            expect(await templ({ val: '' })).to.equal('');
            expect(await templ({ val: [] })).to.equal('');
            expect(await templ({ val: 0 })).to.equal('');
            expect(await templ()).to.equal('');
        });

        it('should run else block with falsy value', async () => {
            const templ = compile('{{#val}}foo{{else}}bar{{/val}}');
            expect(await templ({ val: false })).to.equal('bar');
        });

        it('should not run else block with truthy value', async () => {
            const templ = compile('{{#val}}foo{{else}}bar{{/val}}');
            expect(await templ({ val: true })).to.equal('foo');
        });

        it('should run else block with empty arrays', async () => {
            const templ = compile('{{#val}}foo{{else}}bar{{/val}}');
            expect(await templ({ val: [] })).to.equal('bar');
        });

        it('should not run else block with non-empty arrays', async () => {
            const templ = compile('{{#val}}foo{{else}}bar{{/val}}');
            expect(await templ({ val: [1] })).to.equal('foo');
        });

        it('should run statements N times with array', async () => {
            const templ = compile('{{#val}}foo{{/val}}');
            expect(await templ({ val: [1, 2, 3] })).to.equal('foofoofoo');
        });

        it('should pass parent context when non-object value', async () => {
            const templ = compile('{{#val}}{{foo}}{{/val}}');
            expect(await templ({ val: true, foo: 'bar' })).to.equal('bar');
            expect(await templ({ val: 'a', foo: 'bar' })).to.equal('bar');
            expect(await templ({ val: 1, foo: 'bar' })).to.equal('bar');
        });

        it('should pass object as context', async () => {
            const templ = compile('{{#val}}{{foo}}{{/val}}');
            expect(await templ({ val: { foo: 'bar' }, foo: 'wrong' })).to.equal('bar');
        });

        it('should pass array object items as context', async () => {
            const templ = compile('{{#val}}{{foo}}{{/val}}');
            expect(await templ({ val: [{ foo: 'bar' }, { foo: 'baz' }], foo: 'wrong' })).to.equal('barbaz');
        });

        it('should not pass parent context for array items', async () => {
            const templ = compile('{{#val}}{{foo}}{{/val}}');
            expect(await templ({ val: [true, 'a', 1, null, []], foo: 'bar' })).to.equal('');
        });

        it('should let access current object with $this', async () => {
            const bigodon = new Bigodon();
            bigodon.addHelper('stringify', v => JSON.stringify(v));
            const templ = bigodon.compile('{{#val}}{{stringify $this}}{{/val}}');
            expect(await templ({ val: { foo: 'bar' }})).to.equal('{"foo":"bar"}');
        });

        it('should let access current array item with $this', async () => {
            const templ = compile('{{#arr}}({{$this}}){{/arr}}');
            expect(await templ({ arr: [1, 2, 3] })).to.equal('(1)(2)(3)');
        });

        it('should let access $root for one level', async () => {
            const templ = compile('{{#val}}{{foo}} {{$root.foo}}{{/val}}');
            expect(await templ({ val: { foo: 'inside' }, foo: 'outside' })).to.equal('inside outside');
        });

        it('should let access $root for two levels', async () => {
            const templ = compile('{{#val}}{{#other}}{{foo}} {{$root.foo}}{{/other}}{{/val}}');
            expect(await templ({ val: { other: { foo: 'inside' }, foo: 'middle' }, foo: 'outside' })).to.equal('inside outside');
        });

        it('should let access $parent for one level', async () => {
            const templ = compile('{{#val}}{{foo}} {{$parent.foo}}{{/val}}');
            expect(await templ({ val: { foo: 'inside' }, foo: 'outside' })).to.equal('inside outside');
        });

        it('should let access $parent for two levels', async () => {
            const templ = compile('{{#val}}{{#other}}{{foo}} {{$parent.foo}} {{$parent.$parent.foo}}{{/other}}{{/val}}');
            expect(await templ({ val: { other: { foo: 'inside' }, foo: 'middle' }, foo: 'outside' })).to.equal('inside middle outside');
        });

        it('should run else block with parent context', async () => {
            const templ = compile('{{#val}}nah{{else}}{{foo}}{{/val}}');
            expect(await templ({ val: false, foo: 'bar' })).to.equal('bar');
        });

        it('should run negated blocks', async () => {
            const templ = compile('{{^val}}foo{{/val}}');
            expect(await templ({ val: false })).to.equal('foo');
            expect(await templ({ val: '' })).to.equal('foo');
            expect(await templ({ val: true })).to.equal('');
            expect(await templ({ val: 'a' })).to.equal('');
        });

        it('should run else of negated blocks', async () => {
            const templ = compile('{{^val}}foo{{else}}bar{{/val}}');
            expect(await templ({ val: true })).to.equal('bar');
        });

        it('should run else of negated blocks with parent context', async () => {
            const templ = compile('{{^val}}foo{{else}}{{foo}}{{/val}}');
            expect(await templ({ val: { foo: 'wrong' }, foo: 'bar' })).to.equal('bar');
        });

        it('should run negated blocks with parent context always', async () => {
            const templ = compile('{{^val}}{{foo}}{{/val}}');
            expect(await templ({ val: false, foo: 'bar' })).to.equal('bar');
        });

        it('should accept helper returns as value', async () => {
            const bigodon = new Bigodon();

            bigodon.addHelper('foo', val => new Promise(r => setTimeout(r({ val }), 50)));

            const templ = bigodon.compile('{{#foo "bar"}}{{val}}{{/foo}}');
            expect(await templ()).to.equal('bar');
        });

        it('should nest correctly', async () => {
            const templ = compile('{{#a}}{{#b}}{{c}}{{/b}}{{/a}}');
            expect(await templ({ a: { b: { c: 'foo' } } })).to.equal('foo');
        });

        it('should parse complex templates with mustaches, blocks, and so on', async () => {
            const templ = compile(`
{
    "id": {{id}},
    "code": "{{upper code}}",
    {{#name}}
    "name": "{{name}}",
    {{/name}}
    "items": [
        {{#items}}
          "{{name}}"{{^isLast}},{{/isLast}}
        {{/items}}
    ]
}
            `);
            const a = await templ({
                id: 1,
                code: 'foo',
                name: 'bar',
                items: [{ name: 'baz' }, { name: 'qux', isLast: true }],
            });
            expect(JSON.parse(a)).to.equal({
                id: 1,
                code: 'FOO',
                name: 'bar',
                items: ['baz', 'qux'],
            });

            const b = await templ({
                id: 1,
                code: 'foo',
                items: [],
            });
            expect(JSON.parse(b)).to.equal({
                id: 1,
                code: 'FOO',
                items: [],
            });
        });
    });

    describe('expressions', () => {
        it('should return undefined with literal with no value', async () => {
            const templ = compileExpression('foo');
            expect(await templ()).to.equal(undefined);
        });

        it('should return literal value', async () => {
            const templ = compileExpression('foo');
            expect(await templ({ foo: 'bar' })).to.equal('bar');
        });

        it('should evaluate expression as true', async () => {
            const templ = compileExpression('eq foo "bar"');
            expect(await templ({ foo: 'bar' })).to.equal(true);
        });

        it('should evaluate expression as false', async () => {
            const templ = compileExpression('eq foo "bar"');
            expect(await templ({ foo: 'barz' })).to.equal(false);
        });

        it('should evaluate more complex expression as true', async () => {
            const templ = compileExpression('and (startsWith foo "b") (eq fruit "apple")');
            expect(await templ({ foo: 'bar', fruit: 'apple' })).to.equal(true);
        });
    });
});
