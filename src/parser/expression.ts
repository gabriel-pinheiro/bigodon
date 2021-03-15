import Pr, { Parser } from 'pierrejs';
import { $literal } from './literal';
import { ExpressionStatement, LiteralStatement, Statement } from './statements';
import { optionalSpaces } from './utils';

export type ExpressionOrLiteralStatement = ExpressionStatement | LiteralStatement;
export type ExpresionRecursiveArray = ExpressionOrLiteralStatement[];

/* $lab:coverage:off$ */
enum State {
    _START,
    GOT_LITERAL,
    GOT_PATH,
}
/* $lab:coverage:on$ */

const topOfStack = <T>(stack: T[]): T => stack[stack.length - 1];

const peekEnd = Pr.lookAhead(Pr.string('}}'));
const path: Parser<ExpressionStatement> = Pr.regex('context path', /^[a-zA-Z0-9\-_\.]+/).map(path => ({
    type: 'EXPRESSION',
    path,
    params: [],
}));

export const $expression: Parser<ExpressionOrLiteralStatement> = Pr.context('expression', function*() {
    const stack = [[]];
    let state: State = State._START;

    const expressionFromStack = expr => {
        if(!Array.isArray(expr)) {
            return expr;
        }
        const [stmt, ...params] = expr;
        if(stmt.type === 'LITERAL') {
            return stmt;
        }
        stmt.params = params.map(expressionFromStack);
        return stmt;
    };

    const succeed = () => {
        if(stack.length > 1) {
            throw new Error('Expected ")", make sure every parenthesis was closed');
        }
        return expressionFromStack(stack[0]);
    };

    /* $lab:coverage:off$ */
    while(true) {
    /* $lab:coverage:on$ */
        switch (state) {
            case State._START: {
                yield optionalSpaces;

                const l = yield Pr.optional($literal);
                if (l) {
                    topOfStack(stack).push(l);
                    state = State.GOT_LITERAL;
                    break;
                }

                const p = yield Pr.optional(path);
                if (p) {
                    topOfStack(stack).push(p);
                    state = State.GOT_PATH;
                    break;
                }

                yield Pr.fail('Expected literal, helper or context path');
            }

            case State.GOT_LITERAL: {
                yield optionalSpaces;

                const end = yield Pr.optional(peekEnd);
                if(end) {
                    return succeed();
                }

                const subExprEnd = yield Pr.optional(Pr.string(')'));
                if(subExprEnd) {
                    if(stack.length <= 1) {
                        throw new Error('Unexpected ")", this parenthesis wasn\'t opened');
                    }

                    const expr = stack.pop();
                    topOfStack(stack).push(expr);
                    state = State.GOT_PATH;
                    break;
                }

                yield Pr.fail('Expected "}}". Literal mustaches cannot have parameters.');
            }

            case State.GOT_PATH: {
                yield optionalSpaces;

                const end = yield Pr.optional(peekEnd);
                if(end) {
                    return succeed();
                }

                const param = yield Pr.optional(Pr.either<Statement>($literal, path));
                if(param) {
                    topOfStack(stack).push(param);
                    state = State.GOT_PATH;
                    break;
                }

                const subExpr = yield Pr.optional(Pr.string('('));
                if(subExpr) {
                    stack.push([]);
                    state = State._START;
                    break;
                }

                const subExprEnd = yield Pr.optional(Pr.string(')'));
                if(subExprEnd) {
                    if(stack.length <= 1) {
                        throw new Error('Unexpected ")", this parenthesis wasn\'t opened');
                    }

                    const expr = stack.pop();
                    topOfStack(stack).push(expr);
                    state = State.GOT_PATH;
                    break;
                }

                yield Pr.fail('Expected expression parameters or "}}"');
            }

            /* $lab:coverage:off$ */
            default:
                yield Pr.fail(`Unexpected state ${state} at expression parser`);
            /* $lab:coverage:on$ */
        }
    }
});
