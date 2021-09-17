const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { compile, run } = require('../dist');
const { VERSION } = require('../dist/parser/index');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('runner', () => {
    it('should not run unsupported versions', async () => {
        await expect(run({
            type: 'TEMPLATE',
            version: -1,
            statements: [],
        })).to.reject();

        await expect(run({
            type: 'TEMPLATE',
            version: 1e9,
            statements: [],
        })).to.reject();
    });

    it('should return text statements', async () => {
        const templ = compile('Lorem ipsum');
        expect(await templ()).to.equal('Lorem ipsum');
    });

    it('should ignore comments', async () => {
        const templ = compile('Lorem {{! ipsum }} dolor');
        expect(await templ()).to.equal('Lorem  dolor');
    });

    it('should return literal path expressions', async () => {
        const templ = compile('Hello, {{ "George" }}!');
        expect(await templ()).to.equal('Hello, George!');
    });

    it('should return simple path expressions', async () => {
        const templ = compile('Hello, {{ name }}!');
        expect(await templ({ name: 'George' })).to.equal('Hello, George!');
        expect(await templ()).to.equal('Hello, !');
        expect(await templ({})).to.equal('Hello, !');
        expect(await templ({ name: null })).to.equal('Hello, !');
        expect(await templ({ name: 5 })).to.equal('Hello, 5!');
        expect(await templ({ name: false })).to.equal('Hello, false!');
    });

    it('should return deep path expressions', async () => {
        const templ = compile('Hello, {{ name.first }} {{ name.last }}!');
        expect(await templ({ name: { first: 'George', last: 'Schmidt' } })).to.equal('Hello, George Schmidt!');
        expect(await templ()).to.equal('Hello,  !');
        expect(await templ({})).to.equal('Hello,  !');
        expect(await templ({ name: null })).to.equal('Hello,  !');
        expect(await templ({ name: 5 })).to.equal('Hello,  !');
        expect(await templ({ name: false })).to.equal('Hello,  !');
    });

    it('should ignore unsafe keys', async () => {
        const templ = compile('Hello, {{ name.constructor }} {{ name.__proto__ }}!');
        expect(await templ({ name: {
            __proto__: 'foo',
            constructor: 'bar',
        } })).to.equal('Hello,  !');
    });

    it('should ignore unknown statements', async () => {
        const result = await run({
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
