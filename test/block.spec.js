const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { parse } = require('..');
const { VERSION } = require('../dist/parser');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('parser', () => {
    describe('blocks', () => {
        it('should parse path parameters', () => {
            const result = parse('{{#foo}}{{/foo}}');
            expect(result).to.equal({
                "type": "TEMPLATE",
                "loc": { start: 0, end: 16 },
                "version": VERSION,
                "statements": [
                  {
                    "type": "BLOCK",
                    "loc": { start: 0, end: 16 },
                    "isNegated": false,
                    "expression": {
                      "type": "EXPRESSION",
                      "loc": { start: 3, end: 6 },
                      "path": "foo",
                      "params": []
                    },
                    "statements": []
                  }
                ]
              });
        });

        it('should parse content inside', () => {
            const result = parse('{{#foo}}a{{bar}}b{{/foo}}');
            expect(result).to.equal({
                "type": "TEMPLATE",
                "loc": { start: 0, end: 25 },
                "version": VERSION,
                "statements": [
                  {
                    "type": "BLOCK",
                    "loc": { start: 0, end: 25 },
                    "isNegated": false,
                    "expression": {
                      "type": "EXPRESSION",
                      "loc": { start: 3, end: 6 },
                      "path": "foo",
                      "params": []
                    },
                    "statements": [
                      {
                        "type": "TEXT",
                        "loc": { start: 8, end: 9 },
                        "value": "a"
                      },
                      {
                        "type": "MUSTACHE",
                        "loc": { start: 9, end: 16 },
                        "expression": {
                          "type": "EXPRESSION",
                          "loc": { start: 11, end: 14 },
                          "path": "bar",
                          "params": []
                        }
                      },
                      {
                        "type": "TEXT",
                        "loc": { start: 16, end: 17 },
                        "value": "b"
                      }
                    ]
                  }
                ]
              });
        });

        it('should parse helpers', () => {
            const result = parse('{{#foo bar}}{{/foo}}');
            expect(result).to.equal({
                "type": "TEMPLATE",
                "loc": { start: 0, end: 20 },
                "version": VERSION,
                "statements": [
                  {
                    "type": "BLOCK",
                    "loc": { start: 0, end: 20 },
                    "isNegated": false,
                    "expression": {
                      "type": "EXPRESSION",
                      "loc": { start: 3, end: 10 },
                      "path": "foo",
                      "params": [
                        {
                          "type": "EXPRESSION",
                          "loc": { start: 7, end: 10 },
                          "path": "bar",
                          "params": []
                        }
                      ]
                    },
                    "statements": []
                  }
                ]
              });
        });

        it('should parse nested blocks', () => {
            const result = parse('{{#foo}}{{#bar}}oy{{/bar}}{{/foo}}');
            expect(result).to.equal({
                "type": "TEMPLATE",
                "loc": { start: 0, end: 34 },
                "version": VERSION,
                "statements": [
                  {
                    "type": "BLOCK",
                    "loc": { start: 0, end: 34 },
                    "isNegated": false,
                    "expression": {
                      "type": "EXPRESSION",
                      "loc": { start: 3, end: 6 },
                      "path": "foo",
                      "params": []
                    },
                    "statements": [
                      {
                        "type": "BLOCK",
                        "loc": { start: 8, end: 26 },
                        "isNegated": false,
                        "expression": {
                          "type": "EXPRESSION",
                          "loc": { start: 11, end: 14 },
                          "path": "bar",
                          "params": []
                        },
                        "statements": [
                          {
                            "type": "TEXT",
                            "loc": { start: 16, end: 18 },
                            "value": "oy"
                          }
                        ]
                      }
                    ]
                  }
                ]
              });
        });

        it('should parse negated blocks', () => {
            const result = parse('{{^foo}}{{/foo}}');
            expect(result).to.equal({
                "type": "TEMPLATE",
                "loc": { start: 0, end: 16 },
                "version": VERSION,
                "statements": [
                  {
                    "type": "BLOCK",
                    "loc": { start: 0, end: 16 },
                    "isNegated": true,
                    "expression": {
                      "type": "EXPRESSION",
                      "loc": { start: 3, end: 6 },
                      "path": "foo",
                      "params": []
                    },
                    "statements": []
                  }
                ]
              });
        });

        it('should parse else blocks', () => {
          const result = parse('{{#foo}}first{{else}}second{{/foo}}');
          expect(result).to.equal({
              "type": "TEMPLATE",
              "loc": { start: 0, end: 35 },
              "version": VERSION,
              "statements": [
                {
                  "type": "BLOCK",
                  "loc": { start: 0, end: 35 },
                  "isNegated": false,
                  "expression": {
                    "type": "EXPRESSION",
                    "loc": { start: 3, end: 6 },
                    "path": "foo",
                    "params": []
                  },
                  "statements": [{
                    "type": "TEXT",
                    "loc": { start: 8, end: 13 },
                    "value": "first"
                  }],
                  "elseStatements": [{
                    "type": "TEXT",
                    "loc": { start: 21, end: 27 },
                    "value": "second"
                  }]
                }
              ]
            });
        });

        it('should parse negated else blocks', () => {
          const result = parse('{{^foo}}first{{else}}second{{/foo}}');
          expect(result).to.equal({
              "type": "TEMPLATE",
              "loc": { start: 0, end: 35 },
              "version": VERSION,
              "statements": [
                {
                  "type": "BLOCK",
                  "loc": { start: 0, end: 35 },
                  "isNegated": true,
                  "expression": {
                    "type": "EXPRESSION",
                    "loc": { start: 3, end: 6 },
                    "path": "foo",
                    "params": []
                  },
                  "statements": [{
                    "type": "TEXT",
                    "loc": { start: 8, end: 13 },
                    "value": "first"
                  }],
                  "elseStatements": [{
                    "type": "TEXT",
                    "loc": { start: 21, end: 27 },
                    "value": "second"
                  }]
                }
              ]
            });
        });

        it('should not parse literals', () => {
            expect(() => parse('{{#"foo"}}')).to.throw(/literal blocks are not allowed/i);
            expect(() => parse('{{/"foo"}}')).to.throw(/literal blocks are not allowed/i);
        });

        it('should not parse unclosed blocks', () => {
            expect(() => parse('{{#foo}}')).to.throw(/make sure this block was closed/i);
        });

        it('should not parse block mismatch', () => {
            expect(() => parse('{{#foo}}{{/bar}}')).to.throw(/this block was opened as/i);
        });

        it('should not parse closing blocks with parameters', () => {
            expect(() => parse('{{#foo}}{{/foo bar}}')).to.throw(/closing blocks cannot have parameters/i);
        });

        it('should not parse else blocks outside blocks', () => {
          expect(() => parse('{{else}}')).to.throw(/\{\{else\}\} can only exist inside blocks/i);
        });

        it('should not parse more than one else blocks', () => {
          expect(() => parse('{{#foo}}{{else}}{{else}}{{/foo}}')).to.throw(/an \{\{else\}\} block was already defined/i);
        });

        it('should not parse else blocks with parameters', () => {
          expect(() => parse('{{#foo}}{{else bar}}{{/foo}}')).to.throw(/\{\{else\}\} blocks cannot have parameters/i);
        });
    });
});
