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
            loc: { start: 0, end: 0 },
            version: VERSION,
            statements: [],
        });
    });

    it('should parse text', () => {
        const text = 'Hello World!';
        const result = parse(text);
        expect(result).to.equal({
            type: 'TEMPLATE',
            loc: { start: 0, end: text.length },
            version: VERSION,
            statements: [{
                type: 'TEXT',
                loc: { start: 0, end: text.length },
                value: 'Hello World!',
            }],
        });
    });

    it('should parse mustaches', () => {
        const text = '{{ foo "bar" }}';
        const result = parse(text);
        expect(result).to.equal({
            type: 'TEMPLATE',
            loc: { start: 0, end: text.length },
            version: VERSION,
            statements: [{
                type: 'MUSTACHE',
                loc: { start: 0, end: text.length },
                expression: {
                    type: 'EXPRESSION',
                    loc: { start: 2, end: 13 },
                    path: 'foo',
                    params: [{
                        type: 'LITERAL',
                        loc: { start: 7, end: 12 },
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
            loc: { start: 0, end: text.length },
            version: VERSION,
            statements: [{
                type: 'TEXT',
                loc: { start: 0, end: 3 },
                value: 'foo',
            }, {
                type: 'COMMENT',
                loc: { start: 3, end: 27 },
                value: ' this is a comment ',
            }, {
                type: 'TEXT',
                loc: { start: 27, end: text.length },
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
            "loc": { "start": 0, "end": text.length },
            "version": VERSION,
            "statements": [{
                    "type": "COMMENT",
                    "loc": { "start": 0, "end": 20 },
                    "value": " Greeting user "
                },
                {
                    "type": "TEXT",
                    "loc": { "start": 20, "end": 27 },
                    "value": "\nHello "
                },
                {
                    "type": "MUSTACHE",
                    "loc": { "start": 27, "end": text.length - 1 },
                    "expression": {
                        "type": "EXPRESSION",
                        "loc": { "start": 29, "end": text.length - 3 },
                        "path": "atIndex",
                        "params": [{
                                "type": "EXPRESSION",
                                "loc": { "start": 38, "end": 48 },
                                "path": "split",
                                "params": [{
                                    "type": "EXPRESSION",
                                    "loc": { "start": 44, "end": 48 },
                                    "path": "name",
                                    "params": []
                                }]
                            },
                            {
                                "type": "LITERAL",
                                "loc": { "start": 50, "end": 51 },
                                "value": 0
                            }
                        ]
                    }
                },
                {
                    "type": "TEXT",
                    "loc": { "start": text.length - 1, "end": text.length },
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
            loc: { start: 0, end: text.length },
            version: VERSION,
            statements: [{
                type: 'TEXT',
                loc: { start: 0, end: text.length },
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
