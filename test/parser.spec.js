const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { parse } = require('..');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('parser', () => {
    it('should parse text', () => {
        const text = 'Hello World!';
        const result = parse(text);
        expect(result).to.equal({
            type: 'TEMPLATE',
            statements: [{
                type: 'TEXT',
                value: 'Hello World!',
            }],
        });
    });

    // TODO should parse mustaches

    it('should ignore comments', () => {
        const text = 'foo{{! this is a comment }}bar';
        const result = parse(text);
        expect(result).to.equal({
            type: 'TEMPLATE',
            statements: [{
                type: 'TEXT',
                value: 'foo',
            }, {
                type: 'COMMENT',
                value: ' this is a comment ',
            }, {
                type: 'TEXT',
                value: 'bar',
            }],
        });
    });
    
    // TODO should combine text, mustaches and comments
    // TODO should give friendly error for non-closing tags

    it('should escape open mustaches', () => {
        const text = "hello \\{{ world";
        const result = parse(text);
        expect(result).to.equal({
            type: 'TEMPLATE',
            statements: [{
                type: 'TEXT',
                value: 'hello {{ world',
            }],
        });
    });

    // TODO should escape close mustaches
    // TODO should scape backslashes

    it('should fail on unexpected end block', () => {
        const text = '{{/foo}}';
        expect(() => parse(text)).to.throw(/unexpected block end/i);
    });

    it('should fail on mustache inside mustache', () => {
        const text = '{{! foo {{yada}} bar}}';
        expect(() => parse(text)).to.throw(/column 9/);
    });

    it('should fail on unexpected close mustache', () => {
        const text = 'some text}}';
        expect(() => parse(text)).to.throw(/column 10/);
    });
});
