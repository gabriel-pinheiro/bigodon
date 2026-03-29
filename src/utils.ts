export const UNSAFE_KEYS = new Set([
    '__proto__',
    'constructor',
    'prototype',
    'hasOwnProperty',
]);

export function deepCloneNullPrototype(obj: object): object {
    if (Array.isArray(obj)) {
        return obj.map(deepCloneNullPrototype);
    }

    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    const clone = Object.create(null);
    for (const key of Object.keys(obj)) {
        if (UNSAFE_KEYS.has(key)) {
            continue;
        }
        clone[key] = deepCloneNullPrototype(obj[key]);
    }

    return clone;
}

export function ensure(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(message);
    }
}

export function hasOwnKey(obj: object, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

export function isLookupObject(value: any): value is Record<string, any> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function lookupOwnValue(obj: any, key: string): any {
    if (!isLookupObject(obj) || UNSAFE_KEYS.has(key) || !hasOwnKey(obj, key)) {
        return undefined;
    }

    const value = obj[key];
    if (typeof value === 'function') {
        return undefined;
    }

    return value;
}
