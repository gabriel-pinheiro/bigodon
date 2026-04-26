import { LiteralValue } from '.';
import { ExpressionStatement } from '../parser/statements';
import { lookupOwnValue } from '../utils';
import { Execution } from './execution';

export function runPathExpression(execution: Execution, expression: ExpressionStatement): LiteralValue {
    if (expression.path === '.' || expression.path === '$this') {
        return execution.context;
    }

    const path = expression.path.split('.');
    let contextDeepness = execution.contexts.length - 1;
    let ctx = execution.context;

    if (path[0] === '$this') {
        path.shift();
    } else if (path[0] === '$root') {
        ctx = execution.contexts[0];
        path.shift();
    } else while (path[0] === '$parent') {
        ctx = execution.contexts[--contextDeepness];
        path.shift();
    }

    for (const key of path) {
        const resolved = lookupOwnValue(ctx, key);
        if (typeof resolved === 'undefined') {
            return undefined;
        }

        ctx = resolved;
    }

    return ctx;
}
