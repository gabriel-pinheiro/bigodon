const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { compile } = require('../dist');

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

    describe('typeof', () => {
        it('should return typeof', async () => {
            const templ = compile('{{typeof foo}}');
            expect(await templ({ foo: 'foo' })).to.equal('string');
            expect(await templ({ foo: 1 })).to.equal('number');
            expect(await templ({ foo: true })).to.equal('boolean');
            expect(await templ({ foo: undefined })).to.equal('undefined');
            expect(await templ({ foo: {} })).to.equal('object');
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
            const templ = compile('0{{#each items}}{{#is $this 4}}{{return}}{{/is}}{{$this}}{{/each}}9');
            expect(await templ({ items: [1, 2, 3, 4, 5] })).to.equal('0123');
        });

        it('should halt from inside context blocks', async () => {
            const templ = compile('A{{#with foo}}B{{#is $this "bar"}}{{return}}{{/is}}C{{/with}}D');
            expect(await templ({ foo: 'bar' })).to.equal('AB');
        });
    });

}); });
