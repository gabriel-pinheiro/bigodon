const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { parse } = require('..');
const { VERSION } = require('../dist/parser/index');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('parser', () => {
    it('should parse empty', () => {
        expect(parse('')).to.equal({
            type: 'TEMPLATE',
            version: VERSION,
            statements: [],
        });
    });
    it('should parse text', () => {
        const text = 'Hello World!';
        const result = parse(text);
        expect(result).to.equal({
            type: 'TEMPLATE',
            version: VERSION,
            statements: [{
                type: 'TEXT',
                value: 'Hello World!',
            }],
        });
    });

    it('should parse mustaches', () => {
        const text = '{{ foo "bar" }}';
        const result = parse(text);
        expect(result).to.equal({
            type: 'TEMPLATE',
            version: VERSION,
            statements: [{
                type: 'MUSTACHE',
                expression: {
                    type: 'EXPRESSION',
                    path: 'foo',
                    params: [{
                        type: 'LITERAL',
                        value: 'bar',
                    }],
                },
            }],
        });
    });

    it('should ignore comments', () => {
        const text = 'foo{{! this is a comment }}bar';
        const result = parse(text);
        expect(result).to.equal({
            type: 'TEMPLATE',
            version: VERSION,
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

    it('should combine text, comments and mustaches', () => {
        const text = [
            '{{! Greeting user }}',
            'Hello {{atIndex (split name) 0}}!',
        ].join('\n');
        const result = parse(text);
        expect(result).to.equal({
            "type": "TEMPLATE",
            "version": VERSION,
            "statements": [{
                    "type": "COMMENT",
                    "value": " Greeting user "
                },
                {
                    "type": "TEXT",
                    "value": "\nHello "
                },
                {
                    "type": "MUSTACHE",
                    "expression": {
                        "type": "EXPRESSION",
                        "path": "atIndex",
                        "params": [{
                                "type": "EXPRESSION",
                                "path": "split",
                                "params": [{
                                    "type": "EXPRESSION",
                                    "path": "name",
                                    "params": []
                                }]
                            },
                            {
                                "type": "LITERAL",
                                "value": 0
                            }
                        ]
                    }
                },
                {
                    "type": "TEXT",
                    "value": "!"
                }
            ]
        });
    });

    it('should escape open mustaches', () => {
        const text = "hello \\{{ world";
        const result = parse(text);
        expect(result).to.equal({
            type: 'TEMPLATE',
            version: VERSION,
            statements: [{
                type: 'TEXT',
                value: 'hello {{ world',
            }],
        });
    });

    it('should fail on unexpected end block', () => {
        const text = '{{/foo}}';
        expect(() => parse(text)).to.throw(/this block wasn.t opened/i);
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
