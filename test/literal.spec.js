const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { $literal } = require('../dist/parser/literal');

const li = value => ({ type: 'LITERAL', value });

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('parser', () => {
    describe('literal', () => {

        it('should parse null', () => {
            const result = $literal.parse('null');
            expect(result).to.equal(li(null));
        });

        it('should parse undefined', () => {
            const result = $literal.parse('undefined');
            expect(result).to.equal(li(void 0));
        });

        it('should parse boolean', () => {
            expect($literal.parse('true')).to.equal(li(true));
            expect($literal.parse('false')).to.equal(li(false));
        });

        it('should parse number', () => {
            expect($literal.parse('0')).to.equal(li(0));
            expect($literal.parse('1')).to.equal(li(1));
            expect($literal.parse('-1')).to.equal(li(-1));
            expect($literal.parse('1.1')).to.equal(li(1.1));
            expect($literal.parse('-1.1')).to.equal(li(-1.1));
        });

        it('should parse string', () => {
            expect($literal.parse('"foo"')).to.equal(li('foo'));
            expect($literal.parse('"foo bar"')).to.equal(li('foo bar'));
            expect($literal.parse('"foo\\"bar"')).to.equal(li('foo"bar'));
            expect($literal.parse('"foo\\\\"')).to.equal(li('foo\\'));
            expect($literal.parse('"foo\\nbar"')).to.equal(li('foo\nbar'));
            expect($literal.parse('"foo\\tbar"')).to.equal(li('foo\tbar'));
            expect($literal.parse('"\\foo bar"')).to.equal(li('foo bar'));
        });

        it('should parse strings with single quotes and grave accents', () => {
            expect($literal.parse("'foo'")).to.equal(li('foo'));
            expect($literal.parse("'foo\\\'bar'")).to.equal(li('foo\'bar'));
            expect($literal.parse("`foo`")).to.equal(li('foo'));
            expect($literal.parse("`foo\\\`bar`")).to.equal(li('foo\`bar'));
        });

        it('should fail for non-literals', () => {
            expect(() => $literal.parse('foo')).to.throw();
            expect(() => $literal.parse('.')).to.throw();
        });
    });
});
