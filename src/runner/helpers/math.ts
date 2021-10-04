function add(a: any, b: any): any {
    return Number(a) + Number(b);
}

function subtract(a: any, b: any): any {
    return Number(a) - Number(b);
}

function multiply(a: any, b: any): any {
    return Number(a) * Number(b);
}

function divide(a: any, b: any): any {
    return Number(a) / Number(b);
}

function modulo(a: any, b: any): any {
    return Number(a) % Number(b);
}

export const mathHelpers = Object.assign(Object.create(null), {
    add, sum: add, plus: add,
    subtract, minus: subtract,
    multiply, product: multiply,
    divide, quotient: divide,
    modulo, remainder: modulo, mod: modulo,  		
});
