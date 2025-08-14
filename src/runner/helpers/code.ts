import type { Execution } from '../execution';
const hIf = (a: any) => Boolean(a);
const hTypeof = (a: any) => typeof a;
const hWith = (a: any) => [a];
const hReturn = function(this: Execution): '' {
    this.halt();
    return '' as const;
};

export const codeHelpers = Object.assign(Object.create(null), {
    if: hIf, typeof: hTypeof, with: hWith, return: hReturn,
});
