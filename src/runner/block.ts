import { runStatement, runStatements } from '.';
import { BlockStatement } from '../parser/statements';
import { Execution } from './execution';

const isFalsy = (value: unknown): boolean =>
    !value || (Array.isArray(value) && value.length === 0);

export async function runBlock(execution: Execution, block: BlockStatement): Promise<string | null> {
    const value = await runStatement(execution, block.expression);
    const falsy = isFalsy(value);

    // Negated blocks
    if (block.isNegated) {
        if (falsy) {
            return await runStatements(execution, block.statements);
        }

        if (Array.isArray(block.elseStatements)) {
            return await runStatements(execution, block.elseStatements);
        }

        return null;
    }

    // Falsy value or empty array
    if (falsy) {
        if (Array.isArray(block.elseStatements)) {
            return await runStatements(execution, block.elseStatements);
        }

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

    // Truthy scalar — preserve Bigodon's existing behavior of NOT pushing the
    // scalar onto the context stack. Mustache spec tests that rely on the
    // push are listed in test/spec.spec.js SKIPPED_FEATURES.
    return await runStatements(execution, block.statements);
}
