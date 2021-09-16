const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { compile, run } = require('../dist');
const { VERSION } = require('../dist/parser/index');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('runner', () => {
    it('should not run unsupported versions', () => {
        expect(() => run({
            type: 'TEMPLATE',
            version: -1,
            statements: [],
        })).to.throw();

        expect(() => run({
            type: 'TEMPLATE',
            version: 1e9,
            statements: [],
        })).to.throw();
    });

    it('should return text statements', () => {
        const templ = compile('Lorem ipsum');
        expect(templ()).to.equal('Lorem ipsum');
    });

    it('should ignore comments', () => {
        const templ = compile('Lorem {{! ipsum }} dolor');
        expect(templ()).to.equal('Lorem  dolor');
    });

    it('should return literal path expressions', () => {
        const templ = compile('Hello, {{ "George" }}!');
        expect(templ()).to.equal('Hello, George!');
    });

    it('should return simple path expressions', () => {
        const templ = compile('Hello, {{ name }}!');
        expect(templ({ name: 'George' })).to.equal('Hello, George!');
        expect(templ()).to.equal('Hello, !');
        expect(templ({})).to.equal('Hello, !');
        expect(templ({ name: null })).to.equal('Hello, !');
        expect(templ({ name: 5 })).to.equal('Hello, 5!');
        expect(templ({ name: false })).to.equal('Hello, false!');
    });

    it('should return deep path expressions', () => {
        const templ = compile('Hello, {{ name.first }} {{ name.last }}!');
        expect(templ({ name: { first: 'George', last: 'Schmidt' } })).to.equal('Hello, George Schmidt!');
        expect(templ()).to.equal('Hello,  !');
        expect(templ({})).to.equal('Hello,  !');
        expect(templ({ name: null })).to.equal('Hello,  !');
        expect(templ({ name: 5 })).to.equal('Hello,  !');
        expect(templ({ name: false })).to.equal('Hello,  !');
    });

    it('should ignore unsafe keys', () => {
        const templ = compile('Hello, {{ name.constructor }} {{ name.__proto__ }}!');
        expect(templ({ name: {
            __proto__: 'foo',
            constructor: 'bar',
        } })).to.equal('Hello,  !');
    });

    it('should ignore unknown statements', () => {
        const result = run({
            type: 'TEMPLATE',
            version: VERSION,
            statements: [{
                type: 'TEXT',
                value: 'foo',
            }, {
                type: 'ABLUEBLUE',
                value: 'noope',
            }, {
                type: 'TEXT',
                value: 'bar',
            }]
        });

        expect(result).to.equal('foobar');
    });
});
