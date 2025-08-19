const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { parse } = require('../../dist');
const { VERSION } = require('../../dist/parser');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('parser', () => {
  describe('variables', () => {

    describe('assignment', () => {
      it('should parse variable assignment with number literal', () => {
        const result = parse('{{= $foo 42}}');
        expect(result).to.equal({
          "type": "TEMPLATE",
          "loc": { start: 0, end: 13 },
          "version": VERSION,
          "statements": [
            {
              "type": "ASSIGNMENT",
              "loc": { start: 0, end: 13 },
              "variable": {
                "type": "VARIABLE",
                "loc": { start: 4, end: 8 },
                "name": "$foo"
              },
              "expression": {
                "type": "LITERAL",
                "loc": { start: 9, end: 11 },
                "value": 42
              }
            }
          ]
        });
      });

      it('should parse variable assignment with string literal', () => {
        const result = parse('{{= $name "John"}}');
        expect(result).to.equal({
          "type": "TEMPLATE",
          "loc": { start: 0, end: 18 },
          "version": VERSION,
          "statements": [
            {
              "type": "ASSIGNMENT",
              "loc": { start: 0, end: 18 },
              "variable": {
                "type": "VARIABLE",
                "loc": { start: 4, end: 9 },
                "name": "$name"
              },
              "expression": {
                "type": "LITERAL",
                "loc": { start: 10, end: 16 },
                "value": "John"
              }
            }
          ]
        });
      });

      it('should parse variable assignment with boolean literal', () => {
        const result = parse('{{= $isActive true}}');
        expect(result).to.equal({
          "type": "TEMPLATE",
          "loc": { start: 0, end: 20 },
          "version": VERSION,
          "statements": [
            {
              "type": "ASSIGNMENT",
              "loc": { start: 0, end: 20 },
              "variable": {
                "type": "VARIABLE",
                "loc": { start: 4, end: 13 },
                "name": "$isActive"
              },
              "expression": {
                "type": "LITERAL",
                "loc": { start: 14, end: 18 },
                "value": true
              }
            }
          ]
        });
      });

      it('should parse variable assignment with path expression', () => {
        const result = parse('{{= $userName user.name}}');
        expect(result).to.equal({
          "type": "TEMPLATE",
          "loc": { start: 0, end: 25 },
          "version": VERSION,
          "statements": [
            {
              "type": "ASSIGNMENT",
              "loc": { start: 0, end: 25 },
              "variable": {
                "type": "VARIABLE",
                "loc": { start: 4, end: 13 },
                "name": "$userName"
              },
              "expression": {
                "type": "EXPRESSION",
                "loc": { start: 14, end: 23 },
                "path": "user.name",
                "params": []
              }
            }
          ]
        });
      });

      it('should parse variable assignment with helper expression', () => {
        const result = parse('{{= $upperName (uppercase user.name)}}');
        expect(result).to.equal({
          "type": "TEMPLATE",
          "loc": { start: 0, end: 38 },
          "version": VERSION,
          "statements": [
            {
              "type": "ASSIGNMENT",
              "loc": { start: 0, end: 38 },
              "variable": {
                "type": "VARIABLE",
                "loc": { start: 4, end: 14 },
                "name": "$upperName"
              },
              "expression": {
                "type": "EXPRESSION",
                "loc": { start: 15, end: 36 },
                "path": "uppercase",
                "params": [
                  {
                    "type": "EXPRESSION",
                    "loc": { start: 26, end: 35 },
                    "path": "user.name",
                    "params": []
                  }
                ]
              }
            }
          ]
        });
      });

      it('should parse variable assignment with another variable', () => {
        const result = parse('{{= $copy $original}}');
        expect(result).to.equal({
          "type": "TEMPLATE",
          "loc": { start: 0, end: 21 },
          "version": VERSION,
          "statements": [
            {
              "type": "ASSIGNMENT",
              "loc": { start: 0, end: 21 },
              "variable": {
                "type": "VARIABLE",
                "loc": { start: 4, end: 9 },
                "name": "$copy"
              },
              "expression": {
                "type": "VARIABLE",
                "loc": { start: 10, end: 19 },
                "name": "$original"
              }
            }
          ]
        });
      });

      it('should parse multiple variable assignments', () => {
        const result = parse('{{= $x 1}}{{= $y 2}}{{= $z 3}}');
        expect(result).to.equal({
          "type": "TEMPLATE",
          "loc": { start: 0, end: 30 },
          "version": VERSION,
          "statements": [
            {
              "type": "ASSIGNMENT",
              "loc": { start: 0, end: 10 },
              "variable": {
                "type": "VARIABLE",
                "loc": { start: 4, end: 6 },
                "name": "$x"
              },
              "expression": {
                "type": "LITERAL",
                "loc": { start: 7, end: 8 },
                "value": 1
              }
            },
            {
              "type": "ASSIGNMENT",
              "loc": { start: 10, end: 20 },
              "variable": {
                "type": "VARIABLE",
                "loc": { start: 14, end: 16 },
                "name": "$y"
              },
              "expression": {
                "type": "LITERAL",
                "loc": { start: 17, end: 18 },
                "value": 2
              }
            },
            {
              "type": "ASSIGNMENT",
              "loc": { start: 20, end: 30 },
              "variable": {
                "type": "VARIABLE",
                "loc": { start: 24, end: 26 },
                "name": "$z"
              },
              "expression": {
                "type": "LITERAL",
                "loc": { start: 27, end: 28 },
                "value": 3
              }
            }
          ]
        });
      });

      it('should parse assignment with spaces', () => {
        const result = parse('{{=   $foo   42   }}');
        expect(result).to.equal({
          "type": "TEMPLATE",
          "loc": { start: 0, end: 20 },
          "version": VERSION,
          "statements": [
            {
              "type": "ASSIGNMENT",
              "loc": { start: 0, end: 20 },
              "variable": {
                "type": "VARIABLE",
                "loc": { start: 6, end: 10 },
                "name": "$foo"
              },
              "expression": {
                "type": "LITERAL",
                "loc": { start: 13, end: 15 },
                "value": 42
              }
            }
          ]
        });
      });

      it('should not allow assignment to $this', () => {
        expect(() => parse('{{= $this 42}}')).to.throw(/Expected variable/i);
        expect(() => parse('{{= $this.foo 42}}')).to.throw(/Expected variable/i);
      });

      it('should not allow assignment to $parent', () => {
        expect(() => parse('{{= $parent 42}}')).to.throw(/Expected variable/i);
        expect(() => parse('{{= $parent.foo 42}}')).to.throw(/Expected variable/i);
      });

      it('should not allow assignment to $root', () => {
        expect(() => parse('{{= $root 42}}')).to.throw(/Expected variable/i);
        expect(() => parse('{{= $root.foo 42}}')).to.throw(/Expected variable/i);
      });

      it('should not allow assignment without variable name', () => {
        expect(() => parse('{{= 42}}')).to.throw(/Expected variable/i);
      });

      it('should not allow assignment without expression', () => {
        expect(() => parse('{{= $foo}}')).to.throw(/Expected literal, variable, path or parenthesized expression/i);
      });

      it('should not allow assignment with multiple expressions', () => {
        expect(() => parse('{{= $foo 42 24}}')).to.throw(/Assignments require a single expression/i);
      });

      it('should not allow assignment to literals', () => {
        expect(() => parse('{{= "foo" 42}}')).to.throw(/Expected variable/i);
        expect(() => parse('{{= 42 24}}')).to.throw(/Expected variable/i);
        expect(() => parse('{{= true 42}}')).to.throw(/Expected variable/i);
        expect(() => parse('{{= false 42}}')).to.throw(/Expected variable/i);
        expect(() => parse('{{= null 42}}')).to.throw(/Expected variable/i);
        expect(() => parse('{{= undefined 42}}')).to.throw(/Expected variable/i);
      });
    });

    describe('usage', () => {
      it('should parse variable in mustache', () => {
        const result = parse('Hello, {{ $name }}!');
        expect(result).to.equal({
          "type": "TEMPLATE",
          "loc": { start: 0, end: 19 },
          "version": VERSION,
          "statements": [
            {
              "type": "TEXT",
              "loc": { start: 0, end: 7 },
              "value": "Hello, "
            },
            {
              "type": "MUSTACHE",
              "loc": { start: 7, end: 18 },
              "expression": {
                "type": "VARIABLE",
                "loc": { start: 9, end: 16 },
                "name": "$name",
              }
            },
            {
              "type": "TEXT",
              "loc": { start: 18, end: 19 },
              "value": "!"
            }
          ]
        });
      });

      it('should parse variable as helper parameter', () => {
        const result = parse('{{capitalize $name}}');
        expect(result).to.equal({
          "type": "TEMPLATE",
          "loc": { start: 0, end: 20 },
          "version": VERSION,
          "statements": [
            {
              "type": "MUSTACHE",
              "loc": { start: 0, end: 20 },
              "expression": {
                "type": "EXPRESSION",
                "loc": { start: 2, end: 18 },
                "path": "capitalize",
                "params": [
                  {
                    "type": "VARIABLE",
                    "loc": { start: 13, end: 18 },
                    "name": "$name"
                  }
                ]
              }
            }
          ]
        });
      });

      it('should parse variable in helper with multiple params', () => {
        const result = parse('{{concat (capitalize $name) "USER"}}');
        expect(result).to.equal({
          "type": "TEMPLATE",
          "loc": { start: 0, end: 36 },
          "version": VERSION,
          "statements": [
            {
              "type": "MUSTACHE",
              "loc": { start: 0, end: 36 },
              "expression": {
                "type": "EXPRESSION",
                "loc": { start: 2, end: 34 },
                "path": "concat",
                "params": [
                  {
                    "type": "EXPRESSION",
                    "loc": { start: 10, end: 26 },
                    "path": "capitalize",
                    "params": [
                      {
                        "type": "VARIABLE",
                        "loc": { start: 21, end: 26 },
                        "name": "$name"
                      }
                    ]
                  },
                  {
                    "type": "LITERAL",
                    "loc": { start: 28, end: 34 },
                    "value": "USER"
                  }
                ]
              }
            }
          ]
        });
      });

      it('should distinguish variables from path discrimination', () => {
        const validNames = [
          '$this',
          '$parent',
          '$root',
          '$this.foo',
          '$parent.foo',
          '$root.foo',
        ];
        validNames.forEach(name => {
          let result = parse(`{{ ${name} }}`);
          expect(result.statements[0].expression.type).to.equal("EXPRESSION");
        });
      });

      it('should handle variables starting with context discrimination names', () => {
        const validNames = [
          '$thisx',
          '$parentx',
          '$rootx',
        ];
        validNames.forEach(name => {
          let result = parse(`{{ ${name} }}`);
          expect(result.statements[0].expression.type).to.equal("VARIABLE");
          expect(result.statements[0].expression.name).to.equal(name);
        });
      });

      it('should handle valid variable names', () => {
        const validNames = [
          '$var123',
          '$foo_bar',
          '$fooBar',
          '$_var',
          '$foo1_1bar123',
          '$1234',
        ];
        validNames.forEach(name => {
          let result = parse(`{{ ${name} }}`);
          expect(result.statements[0].expression.type).to.equal("VARIABLE");
          expect(result.statements[0].expression.name).to.equal(name);
        });
      });

      it('should not allow variables blocks', () => {
        expect(() => parse('{{#$foo}}{{/$foo}}')).to.throw(/Variable blocks are not allowed/);
        expect(() => parse('{{^$foo}}{{/$foo}}')).to.throw(/Variable blocks are not allowed/);
        expect(() => parse('{{/$foo}}')).to.throw(/Variable blocks are not allowed/);
        expect(() => parse('{{#x}}{{else $foo}}{{/x}}')).to.throw(/blocks cannot have variable parameters/);
      });
    });
  });
});
