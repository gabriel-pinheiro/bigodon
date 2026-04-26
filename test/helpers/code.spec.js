const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { compile } = require('../../dist');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('helpers', () => { describe('code', () => {

    describe('if', () => {
        it('should evaluate on true, only', async () => {
            const templ = compile('{{#if foo}}yes{{else}}no{{/if}}');
            expect(await templ({ foo: 'foo' })).to.equal('yes');
            expect(await templ({ foo: '' })).to.equal('no');
        });

        it('should not change context', async () => {
            const templ = compile('{{#if foo}}{{name}}{{else}}no{{/if}}');
            expect(await templ({ foo: { name: 'wrong' }, name: 'foo' })).to.equal('foo');
        });

        it('should run only once', async () => {
            const templ = compile('{{#if foo}}yes{{else}}no{{/if}}');
            expect(await templ({ foo: [1, 2, 3] })).to.equal('yes');
        });
    });

    describe('unless', () => {
        it('should evaluate on false, only', async () => {
            const templ = compile('{{#unless foo}}yes{{else}}no{{/unless}}');
            expect(await templ({ foo: 'foo' })).to.equal('no');
            expect(await templ({ foo: '' })).to.equal('yes');
        });

        it('should not change context', async () => {
            const templ = compile('{{#unless foo}}no{{else}}{{name}}{{/unless}}');
            expect(await templ({ foo: { name: 'wrong' }, name: 'foo' })).to.equal('foo');
        });
    });

    describe('with', () => {
        it('should evaluate with the given context of string, number and boolean', async () => {
            const templ = compile('{{#with foo}}{{$this}}{{/with}}');
            expect(await templ({ foo: 'foo' })).to.equal('foo');
            expect(await templ({ foo: 5 })).to.equal('5');
            expect(await templ({ foo: true })).to.equal('true');
        });

        it('should evaluate with the given context of object', async () => {
            const templ = compile('{{#with foo}}{{bar}}{{/with}}');
            expect(await templ({ foo: { bar: 'baz' } })).to.equal('baz');
        });

        it('should evaluate with the given context of array', async () => {
            const templ = compile('{{#with foo}}{{#each $this}}{{$this}}{{/each}}{{/with}}');
            expect(await templ({ foo: ['bar', 'baz'] })).to.equal('barbaz');
        });

        it('should change context', async () => {
            const templ = compile('{{#with foo}}{{bar}}{{/with}}');
            expect(await templ({ foo: {}, bar: 'wrong' })).to.equal('');
            expect(await templ({ foo: [], bar: 'wrong' })).to.equal('');
            expect(await templ({ foo: 'foo', bar: 'wrong' })).to.equal('');
            expect(await templ({ foo: 5, bar: 'wrong' })).to.equal('');
            expect(await templ({ foo: true, bar: 'wrong' })).to.equal('');
            expect(await templ({ foo: false, bar: 'wrong' })).to.equal('');
            expect(await templ({ foo: null, bar: 'wrong' })).to.equal('');
            expect(await templ({ foo: undefined, bar: 'wrong' })).to.equal('');
        });

        it('should run only once for arrays', async () => {
            const templ = compile('{{#with foo}}bar{{/with}}');
            expect(await templ({ foo: [1, 2, 3] })).to.equal('bar');
        });
    });

    describe('each', () => {
        it('should iterate over array', async () => {
            const templ = compile('{{#each arr}}({{$this}}){{/each}}');
            expect(await templ({ arr: [1, 2, 3] })).to.equal('(1)(2)(3)');
            expect(await templ({ arr: [] })).to.equal('');
        });

        it('should iterate over single non-array item', async () => {
            const templ = compile('{{#each arr}}({{$this}}){{/each}}');
            expect(await templ({ arr: 1 })).to.equal('(1)');
        });
    });

    describe('return', () => {
        it('should return early', async () => {
            const templ = compile('foo{{return}}bar');
            expect(await templ()).to.equal('foo');
        });

        it('should work from inside conditional blocks', async () => {
            const templ = compile('foo{{#if bar}}{{return}}{{/if}}baz');
            expect(await templ({ bar: true })).to.equal('foo');
            expect(await templ({ bar: false })).to.equal('foobaz');
        });

        it('should halt from inside loop blocks', async () => {
            const templ = compile('0{{#each items}}{{#if stop}}{{return}}{{/if}}{{value}}{{/each}}9');
            expect(await templ({ items: [
                { value: 1, stop: false },
                { value: 2, stop: false },
                { value: 3, stop: false },
                { value: 4, stop: true },
                { value: 5, stop: false },
            ] })).to.equal('0123');
        });

        it('should halt from inside context blocks', async () => {
            const templ = compile('A{{#with foo}}B{{#if stop}}{{return}}{{/if}}C{{/with}}D');
            expect(await templ({ foo: { stop: true } })).to.equal('AB');
        });
    });

}); });
