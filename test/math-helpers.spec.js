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

    describe('toInt', () => {
        it('should convert numbers to integers', async () => {
            const templ = compile('{{toInt numA}}');
            expect(await templ({ numA: 2 })).to.equal('2');
            expect(await templ({ numA: 2.5 })).to.equal('2');
            expect(await templ({ numA: '2' })).to.equal('2');
            expect(await templ({ numA: '2.5' })).to.equal('2');
        });

        it('should return NaN for non-numbers', async () => {
            const templ = compile('{{toInt numA}}');
            expect(await templ({ numA: 'foo' })).to.equal('NaN');
        });

        it('should work as toInteger', async () => {
            const templ = compile('{{toInteger numA}}');
            expect(await templ({ numA: 2 })).to.equal('2');
        });

        it('should work as parseInt', async () => {
            const templ = compile('{{parseInt numA}}');
            expect(await templ({ numA: 2 })).to.equal('2');
        });
    });

    describe('toFloat', () => {
        it('should convert numbers to floats', async () => {
            const templ = compile('{{toFloat numA}}');
            expect(await templ({ numA: 2 })).to.equal('2');
            expect(await templ({ numA: 2.5 })).to.equal('2.5');
            expect(await templ({ numA: '2' })).to.equal('2');
            expect(await templ({ numA: '2.5' })).to.equal('2.5');
        });

        it('should return NaN for non-numbers', async () => {
            const templ = compile('{{toFloat numA}}');
            expect(await templ({ numA: 'foo' })).to.equal('NaN');
        });

        it('should work as toDecimal', async () => {
            const templ = compile('{{toDecimal numA}}');
            expect(await templ({ numA: 2.5 })).to.equal('2.5');
        });

        it('should work as parseFloat', async () => {
            const templ = compile('{{parseFloat numA}}');
            expect(await templ({ numA: 2.5 })).to.equal('2.5');
        });
    });

    describe('toNumber', () => {
        it('should convert numbers to numbers', async () => {
            const templ = compile('{{toNumber numA}}');
            expect(await templ({ numA: 2 })).to.equal('2');
            expect(await templ({ numA: 2.5 })).to.equal('2.5');
            expect(await templ({ numA: '2' })).to.equal('2');
            expect(await templ({ numA: '2.5' })).to.equal('2.5');
        });

        it('should return NaN for non-numbers', async () => {
            const templ = compile('{{toNumber numA}}');
            expect(await templ({ numA: 'foo' })).to.equal('NaN');
        });

        it('should work as number', async () => {
            const templ = compile('{{number numA}}');
            expect(await templ({ numA: 2 })).to.equal('2');
        });
    });

    describe('random', () => {
        it('should return a random number in a range', async () => {
            const templ = compile('{{random 2 5}}');
            let min = Infinity;
            let max = -Infinity;

            for (let i = 0; i < 1e3; i++) {
                const num = await templ();
                min = Math.min(num, min);
                max = Math.max(num, max);
            }

            expect(min).to.equal(2);
            expect(max).to.equal(5);
        });

        it('should return NaN for non-numbers', async () => {
            const templ = compile('{{random numA numB}}');
            expect(await templ({ numA: 'foo', numB: '2' })).to.equal('NaN');
            expect(await templ({ numA: '2', numB: 'bar' })).to.equal('NaN');
            expect(await templ({ numA: 'foo', numB: 'bar' })).to.equal('NaN');
        });
    });

    describe('toFixed', () => {
        it('should format a number using fixed-poing notation', async () => {
            const templ = compile('{{toFixed numA digits}}');
            expect(await templ({ numA: 5, digits: 2 })).to.equal('5.00');
            expect(await templ({ numA: 5, digits: 5 })).to.equal('5.00000');
            expect(await templ({ numA: 5.5, digits: 2 })).to.equal('5.50');
            expect(await templ({ numA: 3.14159265, digits: 2 })).to.equal('3.14');
        });

        it('should toFixed number string', async () => {
            const templ = compile('{{toFixed numA digits}}');
            expect(await templ({ numA: '5', digits: 2 })).to.equal('5.00');
            expect(await templ({ numA: '3.14159265', digits: 2 })).to.equal('3.14');
        });

        it('should toFixed number negative', async () => {
            const templ = compile('{{toFixed numA digits}}');
            expect(await templ({ numA: 5, digits: -5 })).to.equal('5');
            expect(await templ({ numA: 5.5, digits: -5 })).to.equal('6');
            expect(await templ({ numA: -5, digits: 2 })).to.equal('-5.00');
        });
    });

    describe('floor', () => {
        it('should return the maximum integer less than or equal to a number', async () => {
            const templ = compile('{{floor numA}}');
            expect(await templ({ numA: 5.9 })).to.equal('5');
            expect(await templ({ numA: 5 })).to.equal('5');
        });

        it('should floor number string', async () => {
            const templ = compile('{{floor numA}}');
            expect(await templ({ numA: '5.9' })).to.equal('5');
            expect(await templ({ numA: '5' })).to.equal('5');
        });

        it('should floor number negative', async () => {
            const templ = compile('{{floor numA}}');
            expect(await templ({ numA: -5.9 })).to.equal('-6');
            expect(await templ({ numA: -5 })).to.equal('-5');
        });
    });

    describe('ceil', () => {
        it('should return the nearest whole integer greater than or equal to a given number', async () => {
            const templ = compile('{{ceil numA}}');
            expect(await templ({ numA: 5.1 })).to.equal('6');
            expect(await templ({ numA: 5 })).to.equal('5');
        });

        it('should ceil number string', async () => {
            const templ = compile('{{ceil numA}}');
            expect(await templ({ numA: '5.1' })).to.equal('6');
            expect(await templ({ numA: '5' })).to.equal('5');
        });

        it('should ceil number negative', async () => {
            const templ = compile('{{ceil numA}}');
            expect(await templ({ numA: -5.1 })).to.equal('-5');
            expect(await templ({ numA: -5 })).to.equal('-5');
            expect(await templ({ numA: -5.9 })).to.equal('-5');
        });
    });

    describe('round', () => {
        it('should return the value of a number rounded to the nearest integer', async () => {
            const templ = compile('{{round numA}}');
            expect(await templ({ numA: 5.1 })).to.equal('5');
            expect(await templ({ numA: 5.5 })).to.equal('6');
        });

        it('should round number string', async () => {
            const templ = compile('{{round numA}}');
            expect(await templ({ numA: '5.1' })).to.equal('5');
            expect(await templ({ numA: '5.5' })).to.equal('6');
        });

        it('should round number negative', async () => {
            const templ = compile('{{round numA}}');
            expect(await templ({ numA: -5 })).to.equal('-5');
            expect(await templ({ numA: -5.5 })).to.equal('-5');
        });
    });

}); });
