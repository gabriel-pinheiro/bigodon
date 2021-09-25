import { LiteralValue } from ".";
import { ExpressionStatement } from "../parser/statements";
import { UNSAFE_KEYS } from "../utils";

export function runPathExpression(expression: ExpressionStatement, context: object): LiteralValue {
    const path = expression.path.split('.');
    let ctx = context;

    for(const key of path) {
        if(ctx === null || typeof ctx !== 'object' || Array.isArray(ctx) || UNSAFE_KEYS.has(key)) {
            // TODO track warn
            return void 0;
        }

        ctx = ctx[key];
    }

    return ctx;
}
