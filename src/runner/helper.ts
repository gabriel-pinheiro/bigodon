import { LiteralValue, runStatement } from "./index";
import { ExpressionStatement } from "../parser/statements";
import { helpers } from "./helpers";
import { UNSAFE_KEYS } from "../utils";

export async function runHelperExpression(expression: ExpressionStatement,
                                          context: object,
                                          extraHelpers: Map<string, Function>): Promise<LiteralValue> {
    const helperName = expression.path;
    if(UNSAFE_KEYS.has(helperName)) {
        throw new Error(`Helper ${helperName} not allowed`);
    }

    const fn = extraHelpers.get(helperName) || helpers[helperName];
    if(!fn) {
        throw new Error(`Helper ${helperName} not found`);
    }

    const paramsTasks = expression.params.map(p => runStatement(p, context, extraHelpers));
    const params = await Promise.all(paramsTasks);
    const result = await fn(...params);
    return result;
}
