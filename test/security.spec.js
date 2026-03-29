const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { compile, compileExpression, default: Bigodon } = require('../dist');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('security', () => {
    describe('SSTI tests', () => {
        it('blocks prototype traversal via __proto__/constructor/prototype', async () => {
            const templ = compile('{{ obj.__proto__ }}{{ obj.constructor }}{{ obj.prototype }}');
            const res = await templ({ obj: { a: 1 } });
            expect(res).to.equal('');
        });

        it('blocks prototype traversal on nested paths', async () => {
            const templ = compile('{{ user.profile.__proto__.polluted }}');
            const res = await templ({ user: { profile: { name: 'x' } } });
            expect(res).to.equal('');
        });

        it('does not allow accessing function constructors', async () => {
            const templ = compile('{{ obj.constructor.constructor }}');
            const res = await templ({ obj: {} });
            expect(res).to.equal('');
        });

        it('cannot call arbitrary functions from context (helpers only)', async () => {
            const ctx = { exec: () => 'pwned' };
            const templ = compile('{{ exec "ignored" }}');
            await expect(templ(ctx)).to.reject(/helper exec not found/i);
        });

        it('arrays do not expose properties (like length,toString)', async () => {
            const templ = compile('{{ arr.length }}{{ arr.toString }}');
            const res = await templ({ arr: [] });
            expect(res).to.equal('');
        });

        it('numbers/strings do not expose prototype methods', async () => {
            const templ = compile('{{ num.toFixed }}{{ str.toUpperCase }}');
            const res = await templ({ num: 1, str: 'abc' });
            expect(res).to.equal('');
        });

        it('pluck refuses UNSAFE keys like constructor', async () => {
            const templ = compile('{{ join (pluck arr "constructor") "," }}');
            await expect(templ({ arr: [{ a: 1 }, { b: 2 }] }))
                .to.reject(/pluck does not allow access to unsafe key "constructor"/i);
        });

        it('pluck refuses function items', async () => {
            const templ = compile('{{ join (pluck arr "name") "," }}');
            await expect(templ({ arr: [() => 'x'] }))
                .to.reject(/pluck does not allow function items/i);
        });

        it('pluck refuses function-valued properties', async () => {
            const templ = compile('{{ join (pluck arr "fn") "," }}');
            await expect(templ({ arr: [{ fn() { return 'x'; } }] }))
                .to.reject(/pluck does not allow function-valued properties/i);
        });

        it('pluck does not expose inherited properties', async () => {
            const parent = { name: 'foo' };
            const child = Object.create(parent);
            const templ = compile('{{ join (pluck arr "name") "," }}');
            const res = await templ({ arr: [child] });
            expect(res).to.equal('');
        });

        it('helper names cannot be UNSAFE keys', async () => {
            const templ = compile('{{ __proto__ 1 }}');
            await expect(templ()).to.reject(/helper __proto__ not allowed/i);
        });

        it('variable values cannot be traversed via dot access', async () => {
            expect(() => compile('{{= $x obj}}{{ $x.constructor }}'))
                .to.throw(/Literal mustaches cannot have parameters/);
        });

        it('cannot reach global objects via $this/$root/$parent', async () => {
            const bigodon = new Bigodon();
            const templ = bigodon.compile('{{ $this.constructor }}{{$root.constructor}}');
            const res = await templ({ a: 1 });
            expect(res).to.equal('');
        });

        it('assignment cannot be abused to run helpers implicitly', async () => {
            const templ = compile('{{= $if true}}{{#if}}ok{{/if}}');
            const res = await templ();
            expect(res).to.equal('');
        });

        it('function-valued properties are hidden on path access', async () => {
            const templ = compile('{{ obj.fn }}');
            const res = await templ({ obj: { fn: function hello() { return 'x'; } } });
            expect(res).to.equal('');
        });

        it('top-level function-valued properties are hidden on path access', async () => {
            const templ = compile('{{ foo }}');
            const res = await templ({ foo: () => {} });
            expect(res).to.equal('');
        });

        it('expressions cannot reach process via constructor.constructor', async () => {
            const templ = compileExpression('obj.constructor.constructor');
            const res = await templ({ obj: {} });
            expect(res).to.equal(undefined);
        });

        it('pick refuses UNSAFE keys like constructor', async () => {
            const templ = compile('{{ pick obj "constructor" }}');
            await expect(templ({ obj: { a: 1 } }))
                .to.reject(/pick does not allow access to unsafe key "constructor"/i);
        });

        it('pick rejects array access and hints itemAt', async () => {
            const templ = compile('{{ pick arr "length" }}');
            await expect(templ({ arr: [1, 2, 3] }))
                .to.reject(/use itemAt for array indexing/i);
        });

        it('pick hides function-valued properties', async () => {
            const templ = compile('{{ pick obj "fn" }}');
            const res = await templ({ obj: { fn() { return 'x'; } } });
            expect(res).to.equal('');
        });

        it('pick does not expose inherited properties', async () => {
            const parent = { name: 'foo' };
            const child = Object.create(parent);
            const templ = compile('{{ pick obj "name" }}');
            const res = await templ({ obj: child });
            expect(res).to.equal('');
        });

        it('path access does not expose inherited enumerable properties', async () => {
            const parent = { leaked: 'x' };
            const child = Object.create(parent);
            const templ = compile('{{ obj.leaked }}');
            const res = await templ({ obj: child });
            expect(res).to.equal('');
        });
    });
});
