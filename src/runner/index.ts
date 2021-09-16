import { ExpressionStatement, Statement, TemplateStatement } from "../parser/statements";

const MIN_VERSION = 1;
const MAX_VERSION = 1;

const UNSAFE_KEYS = [
    '__proto__',
    'constructor',
    'prototype',
    'hasOwnProperty',
];

export function run(ast: TemplateStatement, context: object = {}): string {
    if(ast.version < MIN_VERSION || ast.version > MAX_VERSION) {
        throw new Error(`Unsupported AST version ${ast.version}, parse it again to generate a new AST`);
    }

    const ctx = deepCloneNullPrototype(context);
    const statementResults = ast.statements.map(s => runStatement(s, ctx));
    return statementResults.join('');
}

function deepCloneNullPrototype(obj: object): object {
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

function runStatement(statement: Statement, context: object): string {
    try {
        return _runStatement(statement, context);
    } catch(e) {
        // TODO track warn
        return '';
    }
}

function _runStatement(statement: Statement, context: object): string {
    switch(statement.type) {
        case 'TEXT':
            return statement.value;
        case 'COMMENT':
            return '';
        case 'LITERAL':
            return String(statement.value);
        case 'MUSTACHE':
            return runStatement(statement.expression, context);
        case 'EXPRESSION':
            return runExpression(statement, context);
        default:
            // TODO track warn
            throw new Error(`Unsupported statement type ${statement.type}`);
    }
}

function runExpression(expression: ExpressionStatement, context: object): string {
    if(expression.params.length === 0) {
        return runPathExpression(expression, context);
    }

    return runHelperExpression(expression, context);
}

function runPathExpression(expression: ExpressionStatement, context: object): string {
    const path = expression.path.split('.');
    let ctx = context;

    for(const key of path) {
        if(ctx === null || typeof ctx !== 'object' || UNSAFE_KEYS.includes(key)) {
            // TODO track warn
            return '';
        }

        ctx = ctx[key];
    }

    if(typeof ctx === 'undefined' || ctx === null) {
        return '';
    }

    return String(ctx);
}

function runHelperExpression(expression: ExpressionStatement, context: object): string {
    throw new Error('Not implemented');
}
