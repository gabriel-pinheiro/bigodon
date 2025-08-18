import Pr, { Parser } from 'pierrejs';
import { AssignmentStatement, ValueStatement, VariableStatement } from './statements';
import { char, optionalSpaces } from './utils';
import { $expression } from './expression';

export const $variable: Parser<VariableStatement> = Pr.regex(
    'variable',
    /^\$(?!(?:this|root|parent)\b)[a-zA-Z0-9_]*/
).map((name, loc) => ({
    type: 'VARIABLE',
    loc,
    name,
}));

export const $assignment: Parser<AssignmentStatement> = Pr.context('assignment', function* () {
    yield char; // Consume '='
    yield optionalSpaces;
    const variable = yield $variable;
    yield optionalSpaces;
    const expression: ValueStatement = yield $expression;

    return { variable, expression };
}).map((assignment, { start, end }) => ({
    type: 'ASSIGNMENT',
    loc: { start: start - 2, end: end + 2 },
    ...assignment
}));
