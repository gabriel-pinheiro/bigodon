import { LiteralValue } from ".";
import { ExpressionStatement } from "../parser/statements";
import { UNSAFE_KEYS } from "../utils";
import { Execution } from "./execution";

export function runPathExpression(execution: Execution, expression: ExpressionStatement): LiteralValue {
    const path = expression.path.split('.');
    let contextDeepness = execution.contexts.length - 1;
    let ctx = execution.context;

    if(expression.path === '$this') {
        return execution.context;
    } else if(path[0] === '$this') {
        path.shift();
    } else if(path[0] === '$root') {
        ctx = execution.contexts[0];
        path.shift();
    } else while(path[0] === '$parent') {
        ctx = execution.contexts[--contextDeepness];
        path.shift();
    }

    for(const key of path) {
        if(ctx === null || typeof ctx !== 'object' || Array.isArray(ctx) || UNSAFE_KEYS.has(key)) {
            return void 0;
        }

        ctx = ctx[key];
    }

    return ctx;
}
