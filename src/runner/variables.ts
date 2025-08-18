import { AssignmentStatement, VariableStatement } from '../parser/statements';
import { Execution } from './execution';
import { runStatement } from './index';
import { LiteralValue } from './index';

/**
 * Runs a variable assignment statement.
 * Evaluates the expression and stores the result in the execution's variables.
 *
 * @param execution The current execution context
 * @param statement The assignment statement to execute
 * @returns null (assignments don't produce output)
 */
export async function runAssignment(execution: Execution, statement: AssignmentStatement): Promise<LiteralValue> {
    const variableName = statement.variable.name;
    const value = await runStatement(execution, statement.expression);

    execution.variables[variableName] = value;

    return null;
}

/**
 * Runs a variable statement.
 * Retrieves the value of a variable from the execution's variables.
 *
 * @param execution The current execution context
 * @param statement The variable statement to execute
 * @returns The value of the variable, or undefined if not found
 */
export async function runVariable(execution: Execution, statement: VariableStatement): Promise<LiteralValue> {
    return execution.variables[statement.name];
}
