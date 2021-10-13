import { ensure, UNSAFE_KEYS } from '../../utils';

function first(arr: any): any {
    if (!Array.isArray(arr)) {
        return null;
    }

    return arr[0] || null;
}

function last(arr: any): any {
    if (!Array.isArray(arr)) {
        return null;
    }

    return arr[arr.length - 1] || null;
}

function itemAt(arr: any, index: number): any {
    const idx = Number(index);
    ensure(!isNaN(idx), 'itemAt expects second argument to be a number');

    if (!Array.isArray(arr)) {
        return null;
    }

    return arr[idx] || null;
}

function length(arr: any): number {
    if (!Array.isArray(arr) && typeof arr !== 'string') {
        return -1;
    }

    return arr.length;
}

function after(arr: any, index: number): any {
    const idx = Number(index);
    ensure(!isNaN(idx), 'after expects second argument to be a number');

    if (!Array.isArray(arr)) {
        return [];
    }

    return arr.slice(idx);
}

function before(arr: any, index: number): any {
    const idx = Number(index);
    ensure(!isNaN(idx), 'before expects second argument to be a number');

    if (!Array.isArray(arr)) {
        return [];
    }

    return arr.slice(0, idx);
}

function slice(arr: any[], start: number, end: number): any[] {
    ensure(typeof start === 'number' || typeof start === 'undefined',
        'slice expects second argument to be a number');
    ensure(typeof end === 'number' || typeof end === 'undefined',
        'slice expects third argument to be a number');

    if (!Array.isArray(arr)) {
        return [];
    }

    return arr.slice(start, end);
}

function includes(arr: any, value: any): boolean {
    if (typeof arr === 'number') {
        return String(arr).includes(value);
    }

    if (!Array.isArray(arr) && typeof arr !== 'string') {
        return false;
    }

    return arr.includes(value);
}

function isArray(arr: any): boolean {
    return Array.isArray(arr);
}

function each(arr: any): any[] {
    if (Array.isArray(arr)) {
        return arr;
    }

    return [arr];
}

function forEach(arr: any): any[] {
    const original = Array.isArray(arr) ? arr : [arr];
    const result = original.map((item, index) => {
        const obj = Object.create(null);
        obj.item = item;
        obj.index = index;
        obj.total = original.length;
        obj.isFirst = index === 0;
        obj.isLast = index === original.length - 1;
        return obj;
    });

    return result;
}

function join(arr: any, separator: string): string {
    if (!Array.isArray(arr)) {
        return '';
    }

    return arr.join(String(separator));
}

function merge(...arrs: any[]): any[] {
    return arrs.reduce((acc, arr) => {
        if (Array.isArray(arr)) {
            return [...acc, ...arr];
        }

        return [...acc, arr];
    }, []);
}

function reverse(arr: any): any[] | string {
    if (Array.isArray(arr)) {
        return arr.reverse();
    }

    if (typeof arr === 'string') {
        return arr.split('').reverse().join('');
    }

    return [];
}

function pluck(arr: any, key: string): any[] {
    if (!Array.isArray(arr)) {
        return [];
    }

    if (UNSAFE_KEYS.has(key)) {
        return [];
    }

    return arr
        .map(item => item[key])
        .filter(item => item !== void 0);
}

function unique(arr: any): any[] {
    if (!Array.isArray(arr)) {
        return [];
    }

    return Array.from(new Set(arr));
}

function isEmpty(arr: any): boolean {
    if (!Array.isArray(arr)) {
        return false;
    }

    return arr.length === 0;
}


function splice(arr: any[], start: number, deleteCount: number | undefined): any[] {
    ensure(typeof start === 'number', 'splice expects first argument to be a number')
    ensure(typeof deleteCount === 'number' || typeof deleteCount === 'undefined', 'splice expects second argument to be a number')

    if (!Array.isArray(arr)) {
        return [];
    }
    return arr.splice(start);
}

function compareNumbersAscending(a: number, b: number) {
    return a - b;
}
function compareNumbersDescending(a: number, b: number) {
    return b - a;
}

function compareStrings(a: string, b: string) {
    return a.localeCompare(b);
}

function sort(arr: any, desc: boolean): any[] | string {
    ensure(Array.isArray(arr), 'sort expects an array of numbers or strings')

    if (desc) {
        return typeof arr[0] === 'number' ? arr.sort(compareNumbersDescending) : arr.sort(compareStrings).reverse();
    }
    return typeof arr[0] === 'number' ? arr.sort(compareNumbersAscending) : arr.sort(compareStrings)
}

export const arrayHelpers = Object.assign(Object.create(null), {
    first, last, itemAt, length, after, before, slice, includes,
    contains: includes, isArray, each, forEach, join, merge,
    reverse, pluck, unique, isEmpty, splice, sort
});
