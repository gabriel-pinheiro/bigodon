const and = (...args: any[]) => args.map(Boolean).reduce((acc, curr) => acc && curr);
const or = (...args: any[]) => args.map(Boolean).reduce((acc, curr) => acc || curr);
const not = (a: any) => !a;
const eq = (a: any, b: any) => a === b;
const is = (a: any, b: any) => a == b;
const gt = (a: any, b: any) => a > b;
const gte = (a: any, b: any) => a >= b;
const lt = (a: any, b: any) => a < b;
const lte = (a: any, b: any) => a <= b;
const unless = (a: any) => !a;
const hDefault = (...values: any[]) => values.find(v => typeof v !== 'undefined' && v !== null);

export const comparisonHelpers = Object.assign(Object.create(null), {
    and, or, not, eq, is, gt, gte,
    lt, lte, unless, default: hDefault,
    coalesce: hDefault, firstNonNull: hDefault,
});
