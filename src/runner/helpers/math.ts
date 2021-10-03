function add(a: any, b: any): any {
    return Number(a) + Number(b);
}

function subtract(a: any, b: any): any {
    return Number(a) - Number(b);
}

export const mathHelpers = Object.assign(Object.create(null), {
    add, sum: add, plus: add,
    subtract, minus: subtract,
});
