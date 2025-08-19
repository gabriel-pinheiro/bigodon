import Pr, { Parser } from 'pierrejs';
import { AssignmentStatement, ValueStatement, VariableStatement } from './statements';
import { char, optionalSpaces } from './utils';
import { $expression, path } from './expression';
import { $literal } from './literal';

export const $variable: Parser<VariableStatement> = Pr.regex(
    'variable',
    /^\$(?!(?:this|root|parent)\b)[a-zA-Z0-9_]*/
).map((name, loc) => ({
    type: 'VARIABLE',
    loc,
    name,
}));


// Expression statement for assignment only, doesn't allow parameters without parenthesis
const $assignmentExpression: Parser<ValueStatement> = Pr.context('assignment expression', function* () {
    yield optionalSpaces;

    const hasOpenParen = yield Pr.optional(Pr.lookAhead(Pr.string('(')));
    if (hasOpenParen) {
        const expr = yield $expression;
        return expr;
    }

    const literal = yield Pr.optional($literal);
    if (literal) {
        return literal;
    }

    const variable = yield Pr.optional($variable);
    if (variable) {
        return variable;
    }

    const pathExpr = yield Pr.optional(path);
    if (pathExpr) {
        return pathExpr;
    }

    yield Pr.fail('Expected literal, variable, path or parenthesized expression');
}).map(({ type, loc: _, ...v }, loc) => ({ type, loc, ...v }));

export const $assignment: Parser<AssignmentStatement> = Pr.context('assignment', function* () {
    yield char; // Consume '='
    yield optionalSpaces;
    const variable = yield $variable;
    yield optionalSpaces;
    const expression: ValueStatement = yield $assignmentExpression;

    yield optionalSpaces;
    const extraToken = yield Pr.optional(Pr.regex('extra token', /^[^\s}]+/));
    if (extraToken) {
        yield Pr.fail('Assignments require a single expression, use parenthesis for helpers');
    }

    return { variable, expression };
}).map((assignment, { start, end }) => ({
    type: 'ASSIGNMENT',
    loc: { start: start - 2, end: end + 2 },
    ...assignment
}));
