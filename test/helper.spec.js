const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { compile, default: Bigodon } = require('..');

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

        it('should execute parameterless helpers', async () => {
            const templ = compile('{{if}}');
            const result = await templ({ 'if': 'wrong' });
            expect(result).to.equal('false');
        });

        it('should execute parameterless extra helpers', async () => {
            const bigodon = new Bigodon();
            bigodon.addHelper('foo', () => 'bar');
            const templ = bigodon.compile('{{foo}}');
            const result = await templ({ foo: 'wrong' });
            expect(result).to.equal('bar');
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
            const templ = bigodon.compile('{{wait 200}}{{wait 300}}');
            const start = Date.now();
            await templ(bigodon);
            const deltaT = Date.now() - start;
            expect(deltaT).to.be.at.least(490);
            expect(deltaT).to.be.at.most(590);
        });

        it('should pass execution to helpers', async () => {
            const bigodon = new Bigodon();
            bigodon.addHelper('setTitle', function (title) {
                this.data.title = title;
            });

            const templ = bigodon.compile('{{setTitle "Hello"}}');

            const data = {};
            await templ(bigodon, { data });
            expect(data.title).to.equal('Hello');
        });
    });
});
