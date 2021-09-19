import { runStatement, runStatements } from ".";
import { BlockStatement } from "../parser/statements";

export async function runBlock(block: BlockStatement,
                             context: object,
                        extraHelpers: Map<string, Function>): Promise<string | null> {
    const value = await runStatement(block.expression, context, extraHelpers);
    // Negated blocks
    if(block.isNegated) {
        if(value) {
            return null;
        }
        return await runStatements(block.statements, context, extraHelpers);
    }

    // Falsy value or empty array
    if(!value || (Array.isArray(value) && value.length === 0)) {
        return null;
    }

    // Non empty array
    if(Array.isArray(value)) {
        let result = '';

        for(const item of value) {
            let ctx = context;
            if(typeof item === 'object' && item !== null && !Array.isArray(item)) {
                ctx = item;
            }

            result += await runStatements(block.statements, ctx, extraHelpers);
        }

        return result;
    }

    // Object
    if(typeof value === 'object') {
        return await runStatements(block.statements, value, extraHelpers);
    }

    // Truthy value
    return await runStatements(block.statements, context, extraHelpers);
}
