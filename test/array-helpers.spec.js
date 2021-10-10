const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { compile } = require('../dist');
const { arrayHelpers } = require('../dist/runner/helpers/array');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('helpers', () => { describe('array', () => {

    describe('first', () => {
        it('should return first array item', async () => {
            const templ = compile(`{{first arr}}`);
            expect(await templ({ arr: [1, 2, 3] })).to.equal('1');
        });

        it('should return null for empty arrays', async () => {
            const templ = compile(`{{#if (first arr)}}yes{{else}}no{{/if}}`);
            expect(await templ({ arr: [] })).to.equal('no');
            expect(await templ({ arr: [1] })).to.equal('yes');
        });

        it('should return null for non-arrays', async () => {
            const templ = compile(`{{first "foo"}}`);
            expect(await templ()).to.equal('');
        });
    });

    describe('last', () => {
        it('should return last array item', async () => {
            const templ = compile(`{{last arr}}`);
            expect(await templ({ arr: [1, 2, 3] })).to.equal('3');
        });

        it('should return null for empty arrays', async () => {
            const templ = compile(`{{#if (last arr)}}yes{{else}}no{{/if}}`);
            expect(await templ({ arr: [] })).to.equal('no');
            expect(await templ({ arr: [1] })).to.equal('yes');
        });

        it('should return null for non-arrays', async () => {
            const templ = compile(`{{last "foo"}}`);
            expect(await templ()).to.equal('');
        });
    });

    describe('itemAt', () => {
        it('should return item at index', async () => {
            const templ = compile(`{{itemAt arr pos}}`);
            expect(await templ({ arr: [1, 2, 3], pos: 0 })).to.equal('1');
            expect(await templ({ arr: [1, 2, 3], pos: 1 })).to.equal('2');
            expect(await templ({ arr: [1, 2, 3], pos: 2 })).to.equal('3');
        });

        it('should return null for out of index', async () => {
            const templ = compile(`{{itemAt arr pos}}`);
            expect(await templ({ arr: [1, 2, 3], pos: 3 })).to.equal('');
        });

        it('should return null for non-arrays', async () => {
            const templ = compile(`{{itemAt "foo" 1}}`);
            expect(await templ()).to.equal('');
        });

        it('should allow number strings', async () => {
            const templ = compile(`{{itemAt arr "1"}}`);
            expect(await templ({ arr: [1, 2, 3] })).to.equal('2');
        });

        it('should not allow non-numbers', async () => {
            const templ = compile(`{{itemAt arr "a"}}`);
            expect(templ()).to.reject();
        });
    });

    describe('length', () => {
        it('should return length of array', async () => {
            const templ = compile(`{{length arr}}`);
            expect(await templ({ arr: [1, 2, 3] })).to.equal('3');
        });

        it('should return length of string', async () => {
            const templ = compile(`{{length "foo"}}`);
            expect(await templ()).to.equal('3');
        });

        it('should return 0 for empty arrays', async () => {
            const templ = compile(`{{length arr}}`);
            expect(await templ({ arr: [] })).to.equal('0');
        });

        it('should return -1 for non-arrays', async () => {
            const templ = compile(`{{length 5}}`);
            expect(await templ()).to.equal('-1');
        });
    });

    describe('after', () => {
        it('should return items after index', async () => {
            const templ = compile(`{{#after arr pos}}({{$this}}){{/after}}`);
            expect(await templ({ arr: [1, 2, 3], pos: 1 })).to.equal('(2)(3)');
        });

        it('should return empty array', async () => {
            const templ = compile(`{{#after arr pos}}({{$this}}){{/after}}`);
            expect(await templ({ arr: [1, 2, 3], pos: 5 })).to.equal('');
        });

        it('should work with number strings', async () => {
            const templ = compile(`{{#after arr "1"}}({{$this}}){{/after}}`);
            expect(await templ({ arr: [1, 2, 3] })).to.equal('(2)(3)');
        });

        it('should return empty array for non-arrays', async () => {
            const templ = compile(`{{#after "foo" 1}}({{$this}}){{/after}}`);
            expect(await templ()).to.equal('');
        });

        it('should not allow non-numbers', async () => {
            const templ = compile(`{{#after arr "a"}}({{$this}}){{/after}}`);
            expect(templ()).to.reject();
        });
    });

    describe('before', () => {
        it('should return items before index', async () => {
            const templ = compile(`{{#before arr pos}}({{$this}}){{/before}}`);
            expect(await templ({ arr: [1, 2, 3], pos: 2 })).to.equal('(1)(2)');
        });

        it('should return empty array', async () => {
            const templ = compile(`{{#before arr pos}}({{$this}}){{/before}}`);
            expect(await templ({ arr: [1, 2, 3], pos: 0 })).to.equal('');
        });

        it('should return empty array for non-arrays', async () => {
            const templ = compile(`{{#before "foo" 1}}({{$this}}){{/before}}`);
            expect(await templ()).to.equal('');
        });
    });

    describe('slice', () => {
        it('should return items after index', async () => {
            const templ = compile(`{{#slice arr pos}}({{$this}}){{/slice}}`);
            expect(await templ({ arr: [1, 2, 3], pos: 1 })).to.equal('(2)(3)');
        });

        it('should return slice', async () => {
            const templ = compile(`{{#slice arr from to}}({{$this}}){{/slice}}`);
            expect(await templ({ arr: [1, 2, 3, 4], from: 1, to: 3 })).to.equal('(2)(3)');
        });

        it('should return items before with negative index', async () => {
            const templ = compile(`{{#slice arr pos}}({{$this}}){{/slice}}`);
            expect(await templ({ arr: [1, 2, 3], pos: -2 })).to.equal('(2)(3)');
        });

        it('should return empty array for out of index', async () => {
            const templ = compile(`{{#slice arr pos}}({{$this}}){{/slice}}`);
            expect(await templ({ arr: [1, 2, 3], pos: 5 })).to.equal('');
        });

        it('should return empty array for non-arrays', async () => {
            const templ = compile(`{{#slice "foo" 1}}({{$this}}){{/slice}}`);
            expect(await templ()).to.equal('');
        });

        it('should fail for non-numbers', async () => {
            const templ = compile(`{{#slice arr from to}}({{$this}}){{/slice}}`);
            expect(templ({ arr: [], from: 'a' })).to.reject();
            expect(templ({ arr: [], from: 0, to: 'a' })).to.reject();
        });
    });

    describe('includes', () => {
        it('should return true when and only when array includes', async () => {
            const templ = compile(`{{includes arr item}}`);
            expect(await templ({ arr: [1, 2, 3], item: 1 })).to.equal('true');
            expect(await templ({ arr: [1, 2, 3], item: 2 })).to.equal('true');
            expect(await templ({ arr: [1, 2, 3], item: 3 })).to.equal('true');
            expect(await templ({ arr: [1, 2, 3], item: 4 })).to.equal('false');
        });

        it('should work with strings', async () => {
            const templ = compile(`{{includes "lorem ipsum dolor" word}}`);
            expect(await templ({ word: 'ipsum' })).to.equal('true');
            expect(await templ({ word: 'dolores' })).to.equal('false');
        });

        it('should work with numbers', async () => {
            const templ = compile(`{{includes 1234 word}}`);
            expect(await templ({ word: '23' })).to.equal('true');
            expect(await templ({ word: '45' })).to.equal('false');
        });

        it('should return false for non string, number or arrays', async () => {
            const templ = compile(`{{includes item word}}`);
            expect(await templ({ item: { foo: 'bar' }, word: 'bar' })).to.equal('false');
            expect(await templ({ item: true, word: 'true' })).to.equal('false');
        });

        it('should work as contains', async () => {
            const templ = compile(`{{contains arr item}}`);
            expect(await templ({ arr: [1, 2, 3], item: 1 })).to.equal('true');
            expect(await templ({ arr: [1, 2, 3], item: 2 })).to.equal('true');
            expect(await templ({ arr: [1, 2, 3], item: 3 })).to.equal('true');
            expect(await templ({ arr: [1, 2, 3], item: 4 })).to.equal('false');
        });
    });

    describe('isArray', () => {
        it('should return true if and only if its an array', async () => {
            const templ = compile(`{{isArray arr}}`);
            expect(await templ({ arr: [1, 2, 3] })).to.equal('true');
            expect(await templ({ arr: [] })).to.equal('true');
            expect(await templ({ arr: {} })).to.equal('false');
            expect(await templ({ arr: 'foo' })).to.equal('false');
            expect(await templ({ arr: true })).to.equal('false');
            expect(await templ({ arr: null })).to.equal('false');
            expect(await templ({ arr: void 0 })).to.equal('false');
        });
    });

    describe('each', () => {
        it('should iterate over array', async () => {
            const templ = compile(`{{#each arr}}({{$this}}){{/each}}`);
            expect(await templ({ arr: [1, 2, 3] })).to.equal('(1)(2)(3)');
            expect(await templ({ arr: [] })).to.equal('');
        });

        it('should iterate over single item', async () => {
            const templ = compile(`{{#each arr}}({{$this}}){{/each}}`);
            expect(await templ({ arr: 1 })).to.equal('(1)');
        });
    });
    describe('forEach', () => {
        it('should iterate over array', async () => {
            const templ = compile(`{{#forEach arr}}I'm item {{item}}, at index {{index}} of {{total}} I'm {{^isFirst}}not {{/isFirst}}first and I'm {{^isLast}}not {{/isLast}}last; {{/forEach}}`);
            expect(await templ({ arr: ['lorem', 'ipsum', 'dolor'] })).to.equal([
                `I'm item lorem, at index 0 of 3 I'm first and I'm not last; `,
                `I'm item ipsum, at index 1 of 3 I'm not first and I'm not last; `,
                `I'm item dolor, at index 2 of 3 I'm not first and I'm last; `,
            ].join(''));
            expect(await templ({ arr: ['lorem'] })).to.equal(`I'm item lorem, at index 0 of 1 I'm first and I'm last; `);
            expect(await templ({ arr: [] })).to.equal('');
        });

        it('should iterate over single item', async () => {
            const templ = compile(`{{#forEach arr}}I'm item {{item}}, at index {{index}} of {{total}} I'm {{^isFirst}}not {{/isFirst}}first and I'm {{^isLast}}not {{/isLast}}last; {{/forEach}}`);
            expect(await templ({ arr: 'lorem' })).to.equal(`I'm item lorem, at index 0 of 1 I'm first and I'm last; `);
        });

        it('should give null prototype object', async () => {
            const [obj] = arrayHelpers.forEach([{}]);
            expect(obj.toString).to.be.undefined();
        });
    });

    describe('join', () => {
        it('should join array', async () => {
            const templ = compile(`{{join arr ", "}}`);
            expect(await templ({ arr: [1, '2', 3] })).to.equal('1, 2, 3');
            expect(await templ({ arr: [] })).to.equal('');
        });

        it('should return empty string for non-array', async () => {
            const templ = compile(`{{join arr ", "}}`);
            expect(await templ({ arr: 1 })).to.equal('');
            expect(await templ({ arr: true })).to.equal('');
            expect(await templ({ arr: null })).to.equal('');
            expect(await templ({ arr: void 0 })).to.equal('');
        });

        it('should join with non-strings', async () => {
            const templ = compile(`{{join arr 1}}`);
            expect(await templ({ arr: [1, 2, 3] })).to.equal('11213');
        });
    });

    describe('merge', () => {
        it('should merge arrays and items', async () => {
            const templ = compile(`{{join (merge arr1 arr2 arr3) ", "}}`);
            expect(await templ({ arr1: [1, 2, 3], arr2: [4, 5, 6], arr3: [7, 8, 9] })).to.equal('1, 2, 3, 4, 5, 6, 7, 8, 9');
            expect(await templ({ arr1: [1, 2, 3], arr2: 4, arr3: [5, 6, 7] })).to.equal('1, 2, 3, 4, 5, 6, 7');
        });

        it('should work with one param', async () => {
            const templ = compile(`{{join (merge arr1) ", "}}. {{isArray (merge arr1)}}`);
            expect(await templ({ arr1: [1, 2, 3] })).to.equal('1, 2, 3. true');
            expect(await templ({ arr1: 1 })).to.equal('1. true');
        });
    });

    describe('reverse', () => {
        it('should reverse array', async () => {
            const templ = compile(`{{join (reverse arr) ", "}}`);
            expect(await templ({ arr: [1, 2, 3] })).to.equal('3, 2, 1');
            expect(await templ({ arr: [] })).to.equal('');
        });

        it('should reverse strings', async () => {
            const templ = compile(`{{reverse "foo"}}`);
            expect(await templ({})).to.equal('oof');
        });

        it('should return empty array for non strings/arrays', async () => {
            const templ = compile(`{{#reverse item}}nope{{/reverse}}`);
            expect(await templ({ item: 1 })).to.equal('');
            expect(await templ({ item: true })).to.equal('');
            expect(await templ({ item: null })).to.equal('');
            expect(await templ({ item: void 0 })).to.equal('');
        });
    });

    describe('pluck', () => {
        it('should pluck array', async () => {
            const templ = compile(`{{join (pluck arr "name") ", "}}`);
            expect(await templ({ arr: [{ name: 'foo' }, {}, { name: 'bar' }] })).to.equal('foo, bar');
            expect(await templ({ arr: [] })).to.equal('');
        });

        it('should return empty array for non arrays', async () => {
            const templ = compile(`{{join (pluck item "name") ", "}}{{isArray (pluck item "name")}}`);
            expect(await templ({ item: 1 })).to.equal('true');
            expect(await templ({ item: true })).to.equal('true');
            expect(await templ({ item: null })).to.equal('true');
            expect(await templ({ item: void 0 })).to.equal('true');
        });

        it('should not allow unsafe keys', async () => {
            const objWithUnsafeKey = Object.create(null);
            objWithUnsafeKey.__proto__ = 'foo';
            expect(arrayHelpers.pluck([objWithUnsafeKey], '__proto__')[0]).to.equal(void 0);
        });
    });

    describe('unique', () => {
        it('should return unique array', async () => {
            const templ = compile(`{{join (unique arr) ", "}}`);
            expect(await templ({ arr: [1, 2, 1, 2, 3, 2, 1] })).to.equal('1, 2, 3');
            expect(await templ({ arr: [] })).to.equal('');
        });

        it('should return empty array for non arrays', async () => {
            const templ = compile(`{{join (unique item) ", "}}{{isArray (unique item)}}`);
            expect(await templ({ item: 1 })).to.equal('true');
            expect(await templ({ item: true })).to.equal('true');
            expect(await templ({ item: null })).to.equal('true');
            expect(await templ({ item: void 0 })).to.equal('true');
        });
    });

    describe('isEmpty', () => {
      it('should return true if and only if its an array and the array is empty', async () => {
        const templ = compile(`{{isEmpty arr}}`);
        expect(await templ({ arr: [] })).to.equal('true');
        expect(await templ({ arr: [1] })).to.equal('false');
        expect(await templ({ arr: [1, 2, 3] })).to.equal('false');
        expect(await templ({ arr: 'foo' })).to.equal('false');
      });
    })

    describe('splice', () => {
        it('should return items that have been removed given an index', async () => {
            const templ = compile(`{{#splice arr start deleteCount}}({{$this}}){{/splice}}`);
            const actual = await templ({ arr: [1, 2, 3], start:1, deleteCount:2});
            expect(actual).to.equal('(2)(3)');
        });

        it('should remove element from the specified index', async () => {
        const templ = compile(`{{#splice arr start deleteCount}}({{$this}}){{/splice}}`);
        expect(await templ({ arr: [1, 2, 3], start: -1, deleteCount: 1 })).to.equal('(3)');
        });

        it('should return empty array for out of index', async () => {
        const templ = compile(`{{#splice arr start}}({{$this}}){{/splice}}`);
        expect(await templ({ arr: [1, 2, 3], start: 5 })).to.equal('');
        });

        it('should return empty array for non-arrays', async () => {
            const templ = compile(`{{#splice "foo" 1}}({{$this}}){{/splice}}`);
            expect(await templ()).to.equal('');
        });

        it('should fail for non-numbers', async () => {
            const templ = compile(`{{#splice arr start deleteCount elementsToBeAdded}}({{$this}}){{/splice}}`);
            expect(templ({ arr: [], start: 'a' })).to.reject();
            expect(templ({ arr: [], start: 0, deleteCount: 'a' })).to.reject();
        });
    });
}); 
});
