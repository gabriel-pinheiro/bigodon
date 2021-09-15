const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { $expression } = require('../dist/parser/expression');
const parse = code => $expression.parse(code + '}}');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('parser', () => {
    describe('expression', () => {

        it('should parse literals', () => {
            expect(parse('true')).to.equal({
                type: 'LITERAL',
                value: true,
            });
            expect(parse('42')).to.equal({
                type: 'LITERAL',
                value: 42,
            });
            expect(parse('"foo"')).to.equal({
                type: 'LITERAL',
                value: 'foo',
            });
        });

        it('should parse path parameters', () => {
            expect(parse('foo')).to.equal({
                type: 'EXPRESSION',
                path: 'foo',
                params: [],
            });
            expect(parse('foo.bar')).to.equal({
                type: 'EXPRESSION',
                path: 'foo.bar',
                params: [],
            });
            expect(parse('foo.a-b')).to.equal({
                type: 'EXPRESSION',
                path: 'foo.a-b',
                params: [],
            });
        });

        it('should parse helpers', () => {
            expect(parse('foo "bar"')).to.equal({
                type: 'EXPRESSION',
                path: 'foo',
                params: [{
                    type: 'LITERAL',
                    value: 'bar',
                }],
            });
            expect(parse('foo bar')).to.equal({
                type: 'EXPRESSION',
                path: 'foo',
                params: [{
                    type: 'EXPRESSION',
                    path: 'bar',
                    params: [],
                }],
            });
            expect(parse('foo bar baz')).to.equal({
                type: 'EXPRESSION',
                path: 'foo',
                params: [{
                    type: 'EXPRESSION',
                    path: 'bar',
                    params: [],
                }, {
                    type: 'EXPRESSION',
                    path: 'baz',
                    params: [],
                }],
            });
            expect(parse('foo bar "baz"')).to.equal({
                type: 'EXPRESSION',
                path: 'foo',
                params: [{
                    type: 'EXPRESSION',
                    path: 'bar',
                    params: [],
                }, {
                    type: 'LITERAL',
                    value: 'baz',
                }],
            });
        });

        it('should parse parenthised arguments', () => {
            expect(parse('foo ("bar") (5)')).to.equal({
                type: 'EXPRESSION',
                path: 'foo',
                params: [{
                    type: 'LITERAL',
                    value: 'bar',
                }, {
                    type: 'LITERAL',
                    value: 5,
                }],
            });

            expect(parse('foo (bar)')).to.equal({
                type: 'EXPRESSION',
                path: 'foo',
                params: [{
                    type: 'EXPRESSION',
                    path: 'bar',
                    params: [],
                }],
            });
        });

        it('should parse nested expressions', () => {
            expect(parse('foo (bar "5") true')).to.equal({
                type: 'EXPRESSION',
                path: 'foo',
                params: [{
                    type: 'EXPRESSION',
                    path: 'bar',
                    params: [{
                        type: 'LITERAL',
                        value: '5',
                    }],
                }, {
                    type: 'LITERAL',
                    value: true,
                }],
            });
            expect(parse('foo (bar "5" (baz "yada" 7)) true')).to.equal({
                type: 'EXPRESSION',
                path: 'foo',
                params: [{
                    type: 'EXPRESSION',
                    path: 'bar',
                    params: [{
                        type: 'LITERAL',
                        value: '5',
                    }, {
                        type: 'EXPRESSION',
                        path: 'baz',
                        params: [{
                            type: 'LITERAL',
                            value: 'yada',
                        }, {
                            type: 'LITERAL',
                            value: 7,
                        }],
                    }],
                }, {
                    type: 'LITERAL',
                    value: true,
                }],
            });
        });

        it('should not close mustache inside string literal', () => {
            expect(parse('"foo }}"')).to.equal({
                type: 'LITERAL',
                value: 'foo }}',
            });
        });

        it('should give friendly errors', () => {
            expect(() => parse('"foo" 5')).to.throw(/literal mustaches cannot have parameters/i);
            expect(() => parse('foo bar)')).to.throw(/this parenthesis wasn't opened/i);
            expect(() => parse('true)')).to.throw(/this parenthesis wasn't opened/i);
            expect(() => parse('foo (bar')).to.throw(/make sure every parenthesis was closed/i);
            expect(() => parse('foo (true')).to.throw(/make sure every parenthesis was closed/i);
            expect(() => parse('foo ()')).to.throw(/expected literal, helper or context path/i);
            expect(() => parse('foo !')).to.throw(/expected expression parameters or "}}"/i);
        });
    });
});
