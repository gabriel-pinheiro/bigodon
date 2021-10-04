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

    describe('multiply', () => {
        it('should multiply numbers', async () => {
            const templ = compile('{{multiply numA numB}}');
            expect(await templ({ numA: 2, numB: 3 })).to.equal('6');
            expect(await templ({ numA: 2, numB: -1 })).to.equal('-2');
        });

        it('should multiply number strings', async () => {
            const templ = compile('{{multiply numA numB}}');
            expect(await templ({ numA: '2', numB: '3' })).to.equal('6');
            expect(await templ({ numA: '2', numB: '-1' })).to.equal('-2');
        });

        it('should return NaN for non-numbers', async () => {
            const templ = compile('{{multiply numA numB}}');
            expect(await templ({ numA: '2', numB: 'foo' })).to.equal('NaN');
            expect(await templ({ numA: 'foo', numB: '3' })).to.equal('NaN');
        });

        it('should work as times', async () => {
            const templ = compile('{{times numA numB}}');
            expect(await templ({ numA: 2, numB: 2 })).to.equal('4');
        });

        it('should work as product', async () => {
            const templ = compile('{{product numA numB}}');
            expect(await templ({ numA: 2, numB: 2 })).to.equal('4');
        });
    });

    describe('divide', () => {
        it('should divide numbers', async () => {
            const templ = compile('{{divide numA numB}}');
            expect(await templ({ numA: 6, numB: 3 })).to.equal('2');
            expect(await templ({ numA: 6, numB: -3 })).to.equal('-2');
        });

        it('should divide number strings', async () => {
            const templ = compile('{{divide numA numB}}');
            expect(await templ({ numA: '6', numB: '3' })).to.equal('2');
            expect(await templ({ numA: '6', numB: '-3' })).to.equal('-2');
        });

        it('should return NaN for non-numbers', async () => {
            const templ = compile('{{divide numA numB}}');
            expect(await templ({ numA: '6', numB: 'foo' })).to.equal('NaN');
            expect(await templ({ numA: 'foo', numB: '3' })).to.equal('NaN');
        });

        it('should work as dividedBy', async () => {
            const templ = compile('{{quotient numA numB}}');
            expect(await templ({ numA: 6, numB: 3 })).to.equal('2');
        });
    });

    describe('modulo', () => {
        it('should modulo numbers', async () => {
            const templ = compile('{{modulo numA numB}}');
            expect(await templ({ numA: 5, numB: 2 })).to.equal('1');
            expect(await templ({ numA: 12, numB: 3 })).to.equal('0');
            expect(await templ({ numA: 17, numB: 5 })).to.equal('2');
        });

        it('should modulo number strings', async () => {
            const templ = compile('{{modulo numA numB}}');
            expect(await templ({ numA: '5', numB: '2' })).to.equal('1');
            expect(await templ({ numA: '12', numB: '3' })).to.equal('0');
        });

        it('should return NaN for non-numbers', async () => {
            const templ = compile('{{modulo numA numB}}');
            expect(await templ({ numA: '6', numB: 'foo' })).to.equal('NaN');
            expect(await templ({ numA: 'foo', numB: '3' })).to.equal('NaN');
        });

        it('should work as mod', async () => {
            const templ = compile('{{mod numA numB}}');
            expect(await templ({ numA: 5, numB: 2 })).to.equal('1');
        });

        it('should work as remainder', async () => {
            const templ = compile('{{remainder numA numB}}');
            expect(await templ({ numA: 5, numB: 2 })).to.equal('1');
        });
    });

}); });
