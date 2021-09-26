import { LiteralValue } from ".";
import { ExpressionStatement } from "../parser/statements";
import { UNSAFE_KEYS } from "../utils";
import { Execution } from "./execution";

export function runPathExpression(execution: Execution, expression: ExpressionStatement): LiteralValue {
    if(expression.path === '$this') {
        return execution.context;
    }

    const path = expression.path.split('.');
    let ctx = execution.context;

    for(const key of path) {
        if(ctx === null || typeof ctx !== 'object' || Array.isArray(ctx) || UNSAFE_KEYS.has(key)) {
            // TODO track warn
            return void 0;
        }

        ctx = ctx[key];
    }

    return ctx;
}
