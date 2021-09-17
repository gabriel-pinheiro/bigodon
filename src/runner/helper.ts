import { LiteralValue, runStatement } from "./index";
import { ExpressionStatement } from "../parser/statements";
import { helpers } from "./helpers";
import { UNSAFE_KEYS } from "../utils";

export async function runHelperExpression(expression: ExpressionStatement, context: object): Promise<LiteralValue> {
    if(UNSAFE_KEYS.includes(expression.path)) {
        throw new Error(`Helper ${expression.path} not allowed`);
    }

    const fn = helpers[expression.path];
    if(!fn) {
        throw new Error(`Helper ${expression.path} not found`);
    }

    const paramsTasks = expression.params.map(p => runStatement(p, context));
    const params = await Promise.all(paramsTasks);
    const result = await fn(...params);
    return result;
}
