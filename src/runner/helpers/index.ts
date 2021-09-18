import { ensure } from "../../utils";

function append(...args: any[]): string {
    return args
        .map(a => String(a))
        .join('');
}

function upper(str: string): string {
    ensure(typeof str === 'string', 'upper expects a string');
    return str.toUpperCase();
}

function hDefault<T>(value: T | null | undefined, defaultValue: T): T {
    ensure(defaultValue !== null && typeof defaultValue !== 'undefined',
            'default value cannot be null or undefined');
    return value ?? defaultValue;
}

export default Object.assign(Object.create(null), {
    append,
    upper,
    default: hDefault,
});
