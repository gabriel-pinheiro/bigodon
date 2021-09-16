import { ExpressionStatement, Statement, TemplateStatement } from "../parser/statements";
import { deepCloneNullPrototype } from "../utils";
import { runHelperExpression } from "./helper";
import { runPathExpression } from "./path-expression";

const MIN_VERSION = 1;
const MAX_VERSION = 1;

export function run(ast: TemplateStatement, context: object = {}): string {
    if(ast.version < MIN_VERSION || ast.version > MAX_VERSION) {
        throw new Error(`Unsupported AST version ${ast.version}, parse it again to generate a new AST`);
    }

    const ctx = deepCloneNullPrototype(context);
    const statementResults = ast.statements.map(s => runStatement(s, ctx));
    return statementResults.join('');
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
