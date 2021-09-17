const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { deepCloneNullPrototype, ensure } = require('../dist/utils');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('utils', () => {
    describe('deep clone', () => {
        it('should clone an object', () => {
            const obj = {
                a: 5,
                b: { c: { d: 7 }},
            };
            const clone = deepCloneNullPrototype(obj);
            expect(clone).to.equal(obj);

            // mutating clone to check if original keeps unchanged
            clone.b.c.d = 8;
            expect(obj.b.c.d).to.equal(7);
        });

        it('should clone arrays', () => {
            const obj = {
                a: [1, {
                    b: { c: 7 },
                }, 3],
            };
            const clone = deepCloneNullPrototype(obj);
            expect(clone).to.equal(obj);

            // mutating clone to check if original keeps unchanged
            clone.a[1].b.c = 8;
            expect(obj.a[1].b.c).to.equal(7);
        })

        it('should ignore unsafe keys', () => {
            const obj = {
                __proto__: 5,
                constructor: 5,
            };
            const clone = deepCloneNullPrototype(obj);

            expect(clone.__proto__).to.be.undefined();
            expect(clone.constructor).to.be.undefined();
        });
    });

    describe('ensure', () => {
        it('should not throw with true', () => {
            expect(() => ensure(true, 'yada')).to.not.throw();
        });
        it('should throw with false', () => {
            expect(() => ensure(false, 'yada')).to.throw('yada');
        });
    });
});
