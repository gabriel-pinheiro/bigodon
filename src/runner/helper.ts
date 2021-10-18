import { LiteralValue, runStatement } from "./index";
import { ExpressionStatement } from "../parser/statements";
import { helpers } from "./helpers";
import { UNSAFE_KEYS } from "../utils";
import { Execution } from "./execution";

export async function runHelperExpression(execution: Execution, expression: ExpressionStatement): Promise<LiteralValue> {
    const helperName = expression.path;
    if(UNSAFE_KEYS.has(helperName)) {
        throw new Error(`Helper ${helperName} not allowed`);
    }

    const fn = execution.extraHelpers.get(helperName) || helpers[helperName];
    if(!fn) {
        throw new Error(`Helper ${helperName} not found`);
    }

    const paramsTasks = expression.params.map(p => runStatement(execution, p));
    const params = await Promise.all(paramsTasks);
    const result = await fn.apply(execution, params);
    return result;
}
