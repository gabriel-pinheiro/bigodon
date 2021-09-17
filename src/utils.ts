export const UNSAFE_KEYS = [
    '__proto__',
    'constructor',
    'prototype',
    'hasOwnProperty',
];

export function deepCloneNullPrototype(obj: object): object {
    if(Array.isArray(obj)) {
        return obj.map(deepCloneNullPrototype);
    }

    if(obj === null || typeof obj !== 'object') {
        return obj;
    }

    const clone = Object.create(null);
    for(const key in obj) {
        if(UNSAFE_KEYS.includes(key)) {
            continue;
        }
        clone[key] = deepCloneNullPrototype(obj[key]);
    }

    return clone;
}

export function ensure(condition: boolean, message: string): void {
    if(!condition) {
        throw new Error(message);
    }
}
