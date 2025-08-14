const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { compile } = require('../dist');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('helpers', () => { describe('comparison', () => {

    describe('eq', () => {
        it('should return true when and only when equal', async () => {
            const templ = compile('{{#eq foo "foo"}}yes{{else}}no{{/eq}}');
            expect(await templ({ foo: 'foo' })).to.equal('yes');
            expect(await templ({ foo: 'bar' })).to.equal('no');
        });

        it('should compare strictly', async () => {
            const templ = compile('{{#eq five 5}}yes{{else}}no{{/eq}}');
            expect(await templ({ five: 5 })).to.equal('yes');
            expect(await templ({ five: '5' })).to.equal('no');
        });
    });

    describe('is', () => {
        it('should return true when and only when equal', async () => {
            const templ = compile('{{#is foo "foo"}}yes{{else}}no{{/is}}');
            expect(await templ({ foo: 'foo' })).to.equal('yes');
            expect(await templ({ foo: 'bar' })).to.equal('no');
        });

        it('should not compare strictly', async () => {
            const templ = compile('{{#is five 5}}yes{{else}}no{{/is}}');
            expect(await templ({ five: 5 })).to.equal('yes');
            expect(await templ({ five: '5' })).to.equal('yes');
        });
    });

    describe('and', () => {
        it('should return true when and only when all args are true', async () => {
            const templ = compile('{{#and (eq foo "foo") (eq bar "bar")}}yes{{else}}no{{/and}}');
            expect(await templ({ foo: 'foo', bar: 'bar' })).to.equal('yes');
            expect(await templ({ foo: 'foo', bar: 'baz' })).to.equal('no');
            expect(await templ({ foo: 'baz', bar: 'bar' })).to.equal('no');
            expect(await templ({ foo: 'baz', bar: 'baz' })).to.equal('no');
        });

        it('should work with one param', async () => {
            const templ = compile('{{#and (eq foo "foo")}}yes{{else}}no{{/and}}');
            expect(await templ({ foo: 'foo' })).to.equal('yes');
            expect(await templ({ foo: 'baz' })).to.equal('no');
        });

        it('should work with many params', async () => {
            const templ = compile('{{#and (eq foo "foo") (eq bar "bar") (eq baz "baz")}}yes{{else}}no{{/and}}');
            expect(await templ({ foo: 'foo', bar: 'bar', baz: 'baz' })).to.equal('yes');
            expect(await templ({ foo: 'foo', bar: 'bar', baz: 'ALALALALALA' })).to.equal('no');
        });

        it('should not change context', async () => {
            const templ = compile('{{#and foo}}{{name}}{{else}}no{{/and}}');
            expect(await templ({ foo: { name: 'wrong' }, name: 'foo' })).to.equal('foo');
        });
    });

    describe('or', () => {
        it('should return true when and only when any args are true', async () => {
            const templ = compile('{{#or (eq foo "foo") (eq bar "bar")}}yes{{else}}no{{/or}}');
            expect(await templ({ foo: 'foo', bar: 'bar' })).to.equal('yes');
            expect(await templ({ foo: 'foo', bar: 'baz' })).to.equal('yes');
            expect(await templ({ foo: 'baz', bar: 'bar' })).to.equal('yes');
            expect(await templ({ foo: 'baz', bar: 'baz' })).to.equal('no');
        });

        it('should work with one param', async () => {
            const templ = compile('{{#or (eq foo "foo")}}yes{{else}}no{{/or}}');
            expect(await templ({ foo: 'foo' })).to.equal('yes');
            expect(await templ({ foo: 'baz' })).to.equal('no');
        });

        it('should work with many params', async () => {
            const templ = compile('{{#or (eq foo "foo") (eq bar "bar") (eq baz "baz")}}yes{{else}}no{{/or}}');
            expect(await templ({ foo: 'nope', bar: 'nope', baz: 'baz' })).to.equal('yes');
            expect(await templ({ foo: 'nope', bar: 'nope', baz: 'nope' })).to.equal('no');
        });

        it('should not change context', async () => {
            const templ = compile('{{#or foo}}{{name}}{{else}}no{{/or}}');
            expect(await templ({ foo: { name: 'wrong' }, name: 'foo' })).to.equal('foo');
        });
    });

    describe('not', () => {
        it('should negate', async () => {
            const templ = compile('{{#not (eq foo "foo")}}yes{{else}}no{{/not}}');
            expect(await templ({ foo: 'foo' })).to.equal('no');
            expect(await templ({ foo: 'bar' })).to.equal('yes');
        });
    });

    describe('gt', () => {
        it('should return true when and only when greater', async () => {
            const templ = compile('{{#gt num 5}}yes{{else}}no{{/gt}}');
            expect(await templ({ num: 6 })).to.equal('yes');
            expect(await templ({ num: 5 })).to.equal('no');
            expect(await templ({ num: 4 })).to.equal('no');
        });

        it('should work with strings', async () => {
            const templ = compile('{{#gt num 5}}yes{{else}}no{{/gt}}');
            expect(await templ({ num: '6' })).to.equal('yes');
            expect(await templ({ num: '5' })).to.equal('no');
            expect(await templ({ num: '4' })).to.equal('no');
        });
    });

    describe('gte', () => {
        it('should return true when and only when greater', async () => {
            const templ = compile('{{#gte num 5}}yes{{else}}no{{/gte}}');
            expect(await templ({ num: 6 })).to.equal('yes');
            expect(await templ({ num: 5 })).to.equal('yes');
            expect(await templ({ num: 4 })).to.equal('no');
        });

        it('should work with strings', async () => {
            const templ = compile('{{#gte num 5}}yes{{else}}no{{/gte}}');
            expect(await templ({ num: '6' })).to.equal('yes');
            expect(await templ({ num: '5' })).to.equal('yes');
            expect(await templ({ num: '4' })).to.equal('no');
        });
    });

    describe('lt', () => {
        it('should return true when and only when greater', async () => {
            const templ = compile('{{#lt num 5}}yes{{else}}no{{/lt}}');
            expect(await templ({ num: 6 })).to.equal('no');
            expect(await templ({ num: 5 })).to.equal('no');
            expect(await templ({ num: 4 })).to.equal('yes');
        });

        it('should work with strings', async () => {
            const templ = compile('{{#lt num 5}}yes{{else}}no{{/lt}}');
            expect(await templ({ num: '6' })).to.equal('no');
            expect(await templ({ num: '5' })).to.equal('no');
            expect(await templ({ num: '4' })).to.equal('yes');
        });

    });

    describe('lte', () => {
        it('should return true when and only when greater', async () => {
            const templ = compile('{{#lte num 5}}yes{{else}}no{{/lte}}');
            expect(await templ({ num: 6 })).to.equal('no');
            expect(await templ({ num: 5 })).to.equal('yes');
            expect(await templ({ num: 4 })).to.equal('yes');
        });

        it('should work with strings', async () => {
            const templ = compile('{{#lte num 5}}yes{{else}}no{{/lte}}');
            expect(await templ({ num: '6' })).to.equal('no');
            expect(await templ({ num: '5' })).to.equal('yes');
            expect(await templ({ num: '4' })).to.equal('yes');
        });
    });

    describe('unless', () => {
        it('should evaluate on false, only', async () => {
            const templ = compile('{{#unless foo}}yes{{else}}no{{/unless}}');
            expect(await templ({ foo: 'foo' })).to.equal('no');
            expect(await templ({ foo: '' })).to.equal('yes');
        });
    });

    describe('default', () => {
        it('default should return first non null', async () => {
            const templ = compile('{{default foo "bar"}}');
            expect(await templ({ foo: null })).to.equal('bar');
            expect(await templ({})).to.equal('bar');
            expect(await templ({ foo: 0 })).to.equal('0');
        });

        it('default should work with many parameters', async () => {
            const templ = compile('{{default foo bar baz qux}}');
            expect(await templ({ foo: 'yup' })).to.equal('yup');
            expect(await templ({ bar: 'yup' })).to.equal('yup');
            expect(await templ({ baz: 'yup' })).to.equal('yup');
            expect(await templ({ qux: 'yup' })).to.equal('yup');
        });

        it('default should work as firstNonNull', async () => {
            const templ = compile('{{firstNonNull foo "bar"}}');
            expect(await templ({})).to.equal('bar');
        });

        it('default should work as coalesce', async () => {
            const templ = compile('{{coalesce foo "bar"}}');
            expect(await templ({})).to.equal('bar');
        });
    });
}); });
