function add(a: any, b: any): number {
    return Number(a) + Number(b);
}

function subtract(a: any, b: any): number {
    return Number(a) - Number(b);
}

function multiply(a: any, b: any): number {
    return Number(a) * Number(b);
}

function divide(a: any, b: any): number {
    return Number(a) / Number(b);
}

function modulo(a: any, b: any): number {
    return Number(a) % Number(b);
}

function toInt(a: any): number {
    return parseInt(a);
}

function toFloat(a: any): number {
    return parseFloat(a);
}

function toNumber(a: any): number {
    return Number(a);
}

function random(min: any, max: any): number {
    const minNum = Number(min);
    const maxNum = Number(max);

    if(isNaN(minNum) || isNaN(maxNum)) {
        return NaN;
    }

    return Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
}

export const mathHelpers = Object.assign(Object.create(null), {
    add, sum: add, plus: add,
    subtract, minus: subtract,
    multiply, product: multiply, times: multiply,
    divide, quotient: divide,
    modulo, remainder: modulo, mod: modulo,
    toInt, toInteger: toInt, parseInt: toInt,
    toFloat, toDecimal: toFloat, parseFloat: toFloat,
    toNumber, number: toNumber,
    random,
});
