import { runStatement, runStatements } from ".";
import { BlockStatement } from "../parser/statements";

export async function runBlock(block: BlockStatement,
                             context: object,
                        extraHelpers: Map<string, Function>): Promise<string | null> {
    const value = await runStatement(block.expression, context, extraHelpers);
    // Negated blocks
    if(block.isNegated) {
        // Value is true and there is an else block
        if(value && Array.isArray(block.elseStatements)) {
            return await runStatements(block.elseStatements, context, extraHelpers);
        }

        // Value is true and there is no else block
        if(value) {
            return null;
        }

        // Value is false
        return await runStatements(block.statements, context, extraHelpers);
    }

    // Falsy value or empty array
    if(!value || (Array.isArray(value) && value.length === 0)) {
        // Value is false and there is an else block
        if(Array.isArray(block.elseStatements)) {
            return await runStatements(block.elseStatements, context, extraHelpers);
        }

        // Value is false and there is no else block
        return null;
    }

    // Non empty array
    if(Array.isArray(value)) {
        let result = '';

        for(const item of value) {
            result += await runStatements(block.statements, item, extraHelpers);
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
