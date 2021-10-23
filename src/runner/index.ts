import { ExpressionStatement, Statement, TemplateStatement } from '../parser/statements';
import { deepCloneNullPrototype } from '../utils';
import { runBlock } from './block';
import { Execution } from './execution';
import { runHelperExpression } from './helper';
import { helpers } from './helpers';
import { BigodonOptions } from './options';
import { runPathExpression } from './path-expression';

export type LiteralValue =
    string | number | boolean | null | undefined | object;

const MIN_VERSION = 1;
const MAX_VERSION = 2;

export async function run(ast: TemplateStatement,
                          context: object = {},
                          extraHelpers: Map<string, Function>,
                          options?: BigodonOptions): Promise<string> {
    if (ast.version < MIN_VERSION || ast.version > MAX_VERSION) {
        throw new Error(`Unsupported AST version ${ast.version}, parse it again to generate a new AST`);
    }

    const ctx = deepCloneNullPrototype(context);
    const execution = Execution.of(ctx, extraHelpers, options);
    return await runStatements(execution, ast.statements);
}

export async function runStatements(execution: Execution, statements: Statement[]): Promise<string> {
    let result = '';

    for (const statement of statements) {
        const stmtResult = await runStatement(execution, statement);
        if (stmtResult === null || typeof stmtResult === 'undefined') {
            continue;
        }
        if (typeof stmtResult === 'object') {
            result += Object.prototype.toString.call(stmtResult);
            continue;
        }
        result += String(stmtResult);
    }

    return result;
}

export async function runStatement(execution: Execution, statement: Statement): Promise<LiteralValue> {
    switch (statement.type) {
        case 'TEXT':
            return statement.value;
        case 'COMMENT':
            return null;
        case 'LITERAL':
            return statement.value;
        case 'MUSTACHE':
            return await runStatement(execution, statement.expression);
        case 'EXPRESSION':
            return await runExpression(execution, statement);
        case 'BLOCK':
            return await runBlock(execution, statement);
        default:
            return null;
    }
}

async function runExpression(execution: Execution, expression: ExpressionStatement): Promise<LiteralValue> {
    // If there are parameters, the expression is a helper call
    if (expression.params.length > 0) {
        return await runHelperExpression(execution, expression);
    }

    // If there are no parameters but a helper exists with that name, the expression is a helper call
    if (execution.extraHelpers.has(expression.path) || helpers[expression.path]) {
        return await runHelperExpression(execution, expression);
    }

    // Otherwise, it's a path expression
    return runPathExpression(execution, expression);
}
