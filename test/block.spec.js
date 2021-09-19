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
                "version": VERSION,
                "statements": [
                  {
                    "type": "BLOCK",
                    "isNegated": false,
                    "expression": {
                      "type": "EXPRESSION",
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
                "version": VERSION,
                "statements": [
                  {
                    "type": "BLOCK",
                    "isNegated": false,
                    "expression": {
                      "type": "EXPRESSION",
                      "path": "foo",
                      "params": []
                    },
                    "statements": [
                      {
                        "type": "TEXT",
                        "value": "a"
                      },
                      {
                        "type": "MUSTACHE",
                        "expression": {
                          "type": "EXPRESSION",
                          "path": "bar",
                          "params": []
                        }
                      },
                      {
                        "type": "TEXT",
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
                "version": VERSION,
                "statements": [
                  {
                    "type": "BLOCK",
                    "isNegated": false,
                    "expression": {
                      "type": "EXPRESSION",
                      "path": "foo",
                      "params": [
                        {
                          "type": "EXPRESSION",
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
                "version": VERSION,
                "statements": [
                  {
                    "type": "BLOCK",
                    "isNegated": false,
                    "expression": {
                      "type": "EXPRESSION",
                      "path": "foo",
                      "params": []
                    },
                    "statements": [
                      {
                        "type": "BLOCK",
                        "isNegated": false,
                        "expression": {
                          "type": "EXPRESSION",
                          "path": "bar",
                          "params": []
                        },
                        "statements": [
                          {
                            "type": "TEXT",
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
                "version": VERSION,
                "statements": [
                  {
                    "type": "BLOCK",
                    "isNegated": true,
                    "expression": {
                      "type": "EXPRESSION",
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
              "version": VERSION,
              "statements": [
                {
                  "type": "BLOCK",
                  "isNegated": false,
                  "expression": {
                    "type": "EXPRESSION",
                    "path": "foo",
                    "params": []
                  },
                  "statements": [{
                    "type": "TEXT",
                    "value": "first"
                  }],
                  "elseStatements": [{
                    "type": "TEXT",
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
              "version": VERSION,
              "statements": [
                {
                  "type": "BLOCK",
                  "isNegated": true,
                  "expression": {
                    "type": "EXPRESSION",
                    "path": "foo",
                    "params": []
                  },
                  "statements": [{
                    "type": "TEXT",
                    "value": "first"
                  }],
                  "elseStatements": [{
                    "type": "TEXT",
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
