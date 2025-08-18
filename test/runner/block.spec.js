const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { compile, default: Bigodon } = require('../../dist');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('runner', () => { describe('blocks', () => {
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
}); });
