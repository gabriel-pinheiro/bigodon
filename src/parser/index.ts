import Pr, { Parser } from 'pierrejs';
import { $expression } from './expression';
import {
    BlockStatement, CommentStatement, ExpressionStatement,
    LiteralStatement, MustacheStatement, Statement,
    TemplateStatement, TextStatement,
} from './statements';
import {
    atPos, closeMustache, openMustache,
    optionalSpaces, peek, text, char,
} from './utils';

const topOfStack = <T>(stack: T[]): T => stack[stack.length - 1];
const topOfStackStmts = (stack: (TemplateStatement | BlockStatement)[]): Statement[] => {
    const top = stack[stack.length - 1];
    if ('elseStatements' in top) {
        return top.elseStatements;
    }
    return top.statements;
};

const buildBlock = (expression: ExpressionStatement,
                    isNegated: boolean): BlockStatement => ({
    type: 'BLOCK',
    isNegated,
    expression,
    statements: [],
});

export const VERSION = 2;

export const $text: Parser<Statement> = text
    .map((value): TextStatement => ({ type: 'TEXT', value }))
    .withName('text');

export const $comment: Parser<Statement> = Pr.all(char, text)
    .map(atPos(1))
    .map((value): CommentStatement => ({ type: 'COMMENT', value }))
    .withName('comment');

const $mustache: Parser<Statement> = $expression.map(expression => ({
    type: 'MUSTACHE',
    expression,
}));

export const $template = Pr.context('mustache', function* () {
    const stack: [TemplateStatement, ...BlockStatement[]] = [{
        type: 'TEMPLATE',
        version: VERSION,
        statements: [],
    }];

    /* $lab:coverage:off$ */
    while (true) {
    /* $lab:coverage:on$ */
        const txt = yield Pr.optional($text);
        if (txt) {
            topOfStackStmts(stack).push(txt);
            // no need to `continue`, two texts in a row aren't possible
        }

        const open = yield Pr.optional(openMustache);
        if (open) {
            switch (yield peek) {
                case '!': {
                    topOfStackStmts(stack).push(yield $comment);
                    break;
                }

                case '#':
                case '^': {
                    const typeChar = yield char;
                    const expression: ExpressionStatement | LiteralStatement = yield $expression;
                    if (expression.type === 'LITERAL') {
                        yield Pr.fail(`Blocks must receive path expressions or helpers. Literal blocks are not allowed.`);
                        // Never happens, just for typescript to know that below here, expression is not LiteralStatement
                        /* $lab:coverage:off$ */
                        return;
                        /* $lab:coverage:on$ */
                    }

                    stack.push(buildBlock(expression, typeChar === '^'));
                    break;
                }

                case '/': {
                    yield char; // Consuming '/'
                    const expression: ExpressionStatement | LiteralStatement = yield $expression;
                    if (expression.type === 'LITERAL') {
                        yield Pr.fail(`Unexpected {{/${expression.value}}}. Literal blocks are not allowed.`);
                        // Never happens, just for typescript to know that below here, expression is not LiteralStatement
                        /* $lab:coverage:off$ */
                        return;
                        /* $lab:coverage:on$ */
                    }
                    if (expression.params.length > 0) {
                        yield Pr.fail(`Closing blocks cannot have parameters`);
                    }
                    const name = expression.path;
                    if (stack.length <= 1) {
                        yield Pr.fail(`Unexpected {{/${name}}}, this block wasn't opened`);
                    }

                    const block = stack.pop() as BlockStatement;
                    if (block.expression.path !== name) {
                        yield Pr.fail(`Unexpected {{/${name}}}, this block was opened as {{${block.expression.path}}}`);
                    }

                    topOfStackStmts(stack).push(block);
                    break;
                }

                default: {
                    const stmt: MustacheStatement = yield $mustache;

                    // Normal mustache
                    if (stmt.expression.type !== 'EXPRESSION' || stmt.expression.path !== 'else') {
                        topOfStackStmts(stack).push(stmt);
                        break;
                    }

                    // Else block
                    if (stmt.expression.params.length > 0) {
                        yield Pr.fail('{{else}} blocks cannot have parameters');
                    }

                    if (stack.length <= 1) {
                        yield Pr.fail('{{else}} can only exist inside blocks');
                    }

                    const top = topOfStack(stack) as BlockStatement;
                    if (Array.isArray(top.elseStatements)) {
                        yield Pr.fail(`an {{else}} block was already defined for the block ${top.expression.path}`);
                    }

                    top.elseStatements = [];
                    break;
                }
            }

            yield optionalSpaces;
            yield closeMustache;
            continue;
        }

        const end = yield Pr.optional(Pr.end());
        if (end) {
            break;
        }

        yield Pr.fail('Unexpected end of file');
    }

    if (stack.length > 1) {
        const block = topOfStack(stack) as BlockStatement;
        yield Pr.fail(`Expected {{/${block.expression.path}}}, make sure this block was closed`);
    }

    return stack[0];
});
