import { runStatement, runStatements } from '.';
import { BlockStatement } from '../parser/statements';
import { Execution } from './execution';

export async function runBlock(execution: Execution, block: BlockStatement): Promise<string | null> {
    const value = await runStatement(execution, block.expression);
    // Negated blocks
    if (block.isNegated) {
        // Value is true and there is an else block
        if (value && Array.isArray(block.elseStatements)) {
            return await runStatements(execution, block.elseStatements);
        }

        // Value is true and there is no else block
        if (value) {
            return null;
        }

        // Value is false
    return await runStatements(execution, block.statements);
    }

    // Falsy value or empty array
    if (!value || (Array.isArray(value) && value.length === 0)) {
        // Value is false and there is an else block
        if (Array.isArray(block.elseStatements)) {
            return await runStatements(execution, block.elseStatements);
        }

        // Value is false and there is no else block
        return null;
    }

    // Non empty array
    if (Array.isArray(value)) {
        let result = '';

        for (const item of value) {
            execution.pushContext(item);
            result += await runStatements(execution, block.statements);
            execution.popContext();
            if (execution.isHalted) {
                break;
            }
        }

        return result;
    }

    // Object
    if (typeof value === 'object') {
        execution.pushContext(value);
        const result = await runStatements(execution, block.statements);
        execution.popContext();
        return result;
    }

    // Truthy value
    return await runStatements(execution, block.statements);
}
