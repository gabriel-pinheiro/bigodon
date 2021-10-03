const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { compile } = require('../dist');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('helpers', () => { describe('math', () => {

    describe('add', () => {
        it('should add numbers', async () => {
            const templ = compile('{{add numA numB}}');
            expect(await templ({ numA: 2, numB: 3 })).to.equal('5');
            expect(await templ({ numA: 2, numB: -1 })).to.equal('1');
        });

        it('should add number strings', async () => {
            const templ = compile('{{add numA numB}}');
            expect(await templ({ numA: '2', numB: '3' })).to.equal('5');
            expect(await templ({ numA: '2', numB: '-1' })).to.equal('1');
        });

        it('should return NaN for non-numbers', async () => {
            const templ = compile('{{add numA numB}}');
            expect(await templ({ numA: '2', numB: 'foo' })).to.equal('NaN');
            expect(await templ({ numA: 'foo', numB: '3' })).to.equal('NaN');
        });

        it('should work as sum', async () => {
            const templ = compile('{{sum numA numB}}');
            expect(await templ({ numA: 1, numB: 1 })).to.equal('2');
        });

        it('should work as plus', async () => {
            const templ = compile('{{plus numA numB}}');
            expect(await templ({ numA: 1, numB: 1 })).to.equal('2');
        });
    });

    describe('subtract', () => {
        it('should subtract numbers', async () => {
            const templ = compile('{{subtract numA numB}}');
            expect(await templ({ numA: 2, numB: 3 })).to.equal('-1');
            expect(await templ({ numA: 2, numB: -1 })).to.equal('3');
        });

        it('should subtract number strings', async () => {
            const templ = compile('{{subtract numA numB}}');
            expect(await templ({ numA: '2', numB: '3' })).to.equal('-1');
            expect(await templ({ numA: '2', numB: '-1' })).to.equal('3');
        });

        it('should return NaN for non-numbers', async () => {
            const templ = compile('{{subtract numA numB}}');
            expect(await templ({ numA: '2', numB: 'foo' })).to.equal('NaN');
            expect(await templ({ numA: 'foo', numB: '3' })).to.equal('NaN');
        });

        it('should work as minus', async () => {
            const templ = compile('{{minus numA numB}}');
            expect(await templ({ numA: 1, numB: 1 })).to.equal('0');
        });
    });

}); });
