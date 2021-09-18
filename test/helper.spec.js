const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { compile, default: Bigodon } = require('..');
const { VERSION } = require('../dist/parser/index');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('runner', () => {
    describe('helper', () => {
        it('should execute helpers', async () => {
            const templ = compile('Hello, {{upper name }} {{upper "Schmidt" }}!');
            const result = await templ({ name: 'George' });
            expect(result).to.equal('Hello, GEORGE SCHMIDT!');
        });

        it('should execute nested helpers', async () => {
            const templ = compile('Hello, {{upper (append name " schmidt") }}!');
            const result = await templ({ name: 'George' });
            expect(result).to.equal('Hello, GEORGE SCHMIDT!');
        });

        it('should not execute non existing helpers', async () => {
            const templ = compile('Hello, {{non-existing name }}!');
            const result = templ({ name: 'George' });
            expect(result).to.reject(/helper non-existing not found/i);
        });

        it('should not allow unsafe keys as helper names', async () => {
            const templ = compile('Hello, {{__proto__ "Schmidt" }}!');
            expect(templ()).to.reject(/helper __proto__ not allowed/i);
        });

        it('should run extra helpers', async () => {
            const bigodon = new Bigodon();
            bigodon.addHelper('add', (a, b) => a + b);
            const templ = bigodon.compile('{{add 1 2}}');
            const result = await templ(bigodon);
            expect(result).to.equal('3');
        });

        it('should prioritize extra helpers', async () => {
            const bigodon = new Bigodon();
            bigodon.addHelper('upper', () => 5);
            const templ = bigodon.compile('{{upper "hello"}}');
            const result = await templ(bigodon);
            expect(result).to.equal('5');
        });

        it('should preserve helper response types', async () => {
            const bigodon = new Bigodon();
            bigodon.addHelper('add', (a, b) => a + b);
            const templ = bigodon.compile('{{add (add 1 2) 4}}');
            const result = await templ(bigodon);
            expect(result).to.equal('7');
        });

        it('should run async helpers in series', async () => {
            const bigodon = new Bigodon();
            bigodon.addHelper('wait', time => new Promise(resolve => setTimeout(resolve, time)));
            const templ = bigodon.compile('{{wait 20}}{{wait 30}}');
            const start = Date.now();
            await templ(bigodon);
            const deltaT = Date.now() - start;
            expect(deltaT).to.be.at.least(49);
            expect(deltaT).to.be.at.most(59);
        });
    });

    describe('default helpers', () => {
        it('append should return empty for no params', async () => {
            const templ = compile('{{append}}');
            const result = await templ();
            expect(result).to.equal('');
        });

        it('append should return parameter for one param', async () => {
            const templ = compile('{{append "a"}}');
            const result = await templ();
            expect(result).to.equal('a');
        });

        it('append should return concatenated params', async () => {
            const templ = compile('{{append "a" "b" "c" "d"}}');
            const result = await templ();
            expect(result).to.equal('abcd');
        });

        it('upper should fail for non-strings', async () => {
            const templ = compile('{{upper 1}}');
            const result = templ();
            expect(result).to.reject(/upper expects a string/i);
        });

        it('upper should return upper case string', async () => {
            const templ = compile('{{upper "a"}}');
            const result = await templ();
            expect(result).to.equal('A');
        });

        it('default should not allow null or undefined defaults', () => {
            const templ1 = compile('{{default 1}}')();
            expect(templ1).to.reject(/default value cannot be null or undefined/i);
            const templ2 = compile('{{default 1 null}}')();
            expect(templ2).to.reject(/default value cannot be null or undefined/i);
        });

        it('default should return value or default when no value', async () => {
            const templ = compile('{{default foo "bar"}}');
            expect(await templ({ foo: null })).to.equal('bar');
            expect(await templ({})).to.equal('bar');
            expect(await templ({ foo: 0 })).to.equal('0');
        });
    });
});
