import Pr, { Parser } from 'pierrejs';
import { $expression } from './expression';
import {
    BlockStatement, CommentStatement, ExpressionStatement,
    Location, MustacheStatement, Statement,
    TemplateStatement, TextStatement, ValueStatement,
} from './statements';
import {
    atPos, closeMustache, openMustache,
    optionalSpaces, peek, text, char,
} from './utils';
import { $assignment } from './variables';

const topOfStack = <T>(stack: T[]): T => stack[stack.length - 1];
const topOfStackStmts = (stack: (Omit<TemplateStatement, 'loc'> | BlockStatement)[]): Statement[] => {
    const top = stack[stack.length - 1];
    if ('elseStatements' in top) {
        return top.elseStatements;
    }
    return top.statements;
};

const buildBlock = (loc: Location,
                    expression: ExpressionStatement,
                    isNegated: boolean,
                    isNested = false): BlockStatement => {
    const block: BlockStatement = {
        type: 'BLOCK',
        loc,
        isNegated,
        expression,
        statements: [],
    };

    if (isNested) {
        block.isNested = isNested;
    }

    return block;
};

export const VERSION = 3;

// Mustache spec compatibility: standalone-line whitespace stripping.
// A "standalone tag" is one whose containing line has only the tag and
// surrounding whitespace; in that case the entire line (leading whitespace
// and trailing newline) is consumed. Variable interpolation tags
// ({{x}}, {{{x}}}, {{&x}}) are NOT standalone-eligible per spec.
const isWsOnly = (s: string): boolean => /^[ \t]*$/.test(s);

const tryStripStandalone = (
    prev: TextStatement | null,
    next: TextStatement | null,
    atTemplateStart: boolean,
    atTemplateEnd: boolean,
): void => {
    let prevCut = 0;
    if (prev) {
        const v = prev.value;
        if (v !== '') {
            // Non-empty prev. An empty prev was either originally empty or
            // already stripped by an adjacent standalone sibling — either way,
            // the current tag is at line start, so prevCut stays 0.
            const lastNL = v.lastIndexOf('\n');
            const tail = lastNL === -1 ? v : v.slice(lastNL + 1);
            if (!isWsOnly(tail)) return;
            if (lastNL === -1 && !atTemplateStart) return;
            prevCut = lastNL === -1 ? 0 : lastNL + 1;
        }
    }

    let nextCut = 0;
    if (next) {
        const v = next.value;
        const m = v.match(/^([ \t]*)(\r?\n)?/) as RegExpMatchArray;
        const wsLen = m[1].length;
        const nlLen = m[2] ? m[2].length : 0;
        if (nlLen === 0) {
            if (!atTemplateEnd) return;
            if (wsLen !== v.length) return;
        }
        nextCut = wsLen + nlLen;
    }

    if (prev) prev.value = prev.value.slice(0, prevCut);
    if (next) next.value = next.value.slice(nextCut);
};

const asTextOrNull = (s: Statement | undefined): TextStatement | null =>
    s && s.type === 'TEXT' ? s : null;

const stripStandaloneLines = (
    stmts: Statement[],
    atTemplateStart: boolean,
    atTemplateEnd: boolean,
): void => {
    for (let i = 0; i < stmts.length; i++) {
        const stmt = stmts[i];
        const prev = asTextOrNull(stmts[i - 1]);
        const next = asTextOrNull(stmts[i + 1]);
        // A position "feels like" the template start if it's the first stmt
        // in this list AND this list is itself at the template start.
        const slotAtStart = atTemplateStart && (i === 0 || (i === 1 && prev !== null));
        const slotAtEnd = atTemplateEnd && (i === stmts.length - 1 || (i === stmts.length - 2 && next !== null));

        if (stmt.type === 'COMMENT') {
            tryStripStandalone(prev, next, slotAtStart, slotAtEnd);
        } else if (stmt.type === 'BLOCK') {
            const innerFirstText = asTextOrNull(stmt.statements[0]);
            const innerCloseList = (stmt.elseStatements && stmt.elseStatements.length > 0)
                ? stmt.elseStatements
                : stmt.statements;
            const innerLastText = asTextOrNull(innerCloseList[innerCloseList.length - 1]);

            // Opener: prev = parent-list previous TEXT, next = first TEXT inside block
            tryStripStandalone(prev, innerFirstText, slotAtStart, false);
            // Closer: prev = last TEXT inside block, next = parent-list next TEXT
            tryStripStandalone(innerLastText, next, false, slotAtEnd);
        }
    }

    for (const stmt of stmts) {
        if (stmt.type === 'BLOCK') {
            stripStandaloneLines(stmt.statements, false, false);
            if (stmt.elseStatements) {
                stripStandaloneLines(stmt.elseStatements, false, false);
            }
        }
    }
};

export const $text: Parser<Statement> = text
    .map((value, loc): TextStatement => ({ type: 'TEXT', loc, value }))
    .withName('text');

export const $comment: Parser<Statement> = Pr.all(char, text)
    .map(atPos(1))
    .map((value, { start, end }): CommentStatement => ({ type: 'COMMENT', loc: { start: start - 2, end: end + 2 }, value }))
    .withName('comment');

const $mustache: Parser<Statement> = $expression.map((expression, { start, end }) => ({
    type: 'MUSTACHE',
    loc: { start: start - 2, end: end + 2 },
    expression,
}));

// Mustache spec compatibility: `{{#null}}` / `{{#true}}` / `{{#false}}` /
// `{{#undefined}}` look up the matching key in context rather than meaning
// the literal value (Bigodon's normal interpretation). Only applied as a
// block head; expression contexts still treat these names as literals.
const $literalKeyBlockHead: Parser<ExpressionStatement> = Pr.context('literal-key-block-head', function* () {
    yield optionalSpaces;
    const name = yield Pr.regex('literal-key-block-head', /^(null|true|false|undefined)/);
    yield optionalSpaces;
    yield Pr.lookAhead(closeMustache);
    return name;
}).map((name, loc): ExpressionStatement => ({
    type: 'EXPRESSION',
    loc,
    path: name,
    params: [],
}));

export const $template = Pr.context('mustache', function* () {
    const stack: [Omit<TemplateStatement, 'loc'>, ...BlockStatement[]] = [{
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

        const open = yield Pr.optional(openMustache).map((v, loc) => v ? loc : null);
        if (open) {
            switch (yield peek) {
                case '!': {
                    topOfStackStmts(stack).push(yield $comment);
                    break;
                }

                case '=': {
                    topOfStackStmts(stack).push(yield $assignment);
                    break;
                }

                case '&': {
                    yield char;
                    topOfStackStmts(stack).push(yield $mustache);
                    break;
                }

                case '{': {
                    yield char;
                    topOfStackStmts(stack).push(yield $mustache);
                    yield Pr.string('}');
                    break;
                }

                case '#':
                case '^': {
                    const typeChar = yield char;
                    const literalNamed = yield Pr.optional($literalKeyBlockHead);
                    const expression: ValueStatement = literalNamed || (yield $expression);
                    if (expression.type === 'LITERAL') {
                        yield Pr.fail(`Blocks must receive path expressions or helpers. Literal blocks are not allowed.`);
                        // Never happens, just for typescript to know that below here, expression is not LiteralStatement
                        /* $lab:coverage:off$ */
                        return;
                        /* $lab:coverage:on$ */
                    }

                    if (expression.type === 'VARIABLE') {
                        yield Pr.fail(`Variable blocks are not allowed, use '{{#if $var}}' for conditionals or '{{#each $var}}' for loops instead.`);
                        // Never happens, just for typescript to know that below here, expression is not VariableStatement
                        /* $lab:coverage:off$ */
                        return;
                        /* $lab:coverage:on$ */
                    }

                    stack.push(buildBlock(open, expression, typeChar === '^'));
                    break;
                }

                case '/': {
                    yield char; // Consuming '/'
                    const literalNamed = yield Pr.optional($literalKeyBlockHead);
                    const expression: ValueStatement = literalNamed || (yield $expression);
                    if (expression.type === 'LITERAL') {
                        yield Pr.fail(`Unexpected {{/${expression.value}}}. Literal blocks are not allowed to be closed.`);
                        // Never happens, just for typescript to know that below here, expression is not LiteralStatement
                        /* $lab:coverage:off$ */
                        return;
                        /* $lab:coverage:on$ */
                    }
                    if (expression.type === 'VARIABLE') {
                        yield Pr.fail(`Unexpected {{/${expression.name}}}. Variable blocks are not allowed.`);
                        // Never happens, just for typescript to know that below here, expression is not VariableStatement
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

                    let block = stack.pop() as BlockStatement;

                    // Nested blocks auto-close when parent is closed
                    while (block.isNested) {
                        block.loc.end = expression.loc.end + 2;
                        topOfStackStmts(stack).push(block);
                        block = stack.pop() as BlockStatement;
                    }

                    // Non nested blocks must close with same expression
                    if (block.expression.path !== name) {
                        yield Pr.fail(`Unexpected {{/${name}}}, this block was opened as {{#${block.expression.path}}}`);
                    }

                    block.loc.end = expression.loc.end + 2;
                    topOfStackStmts(stack).push(block);
                    break;
                }

                default: {
                    const isElseBlock = yield Pr.optional(
                        Pr.all(
                            optionalSpaces,
                            Pr.string('else'),
                            Pr.oneOf(Pr.string(' '), Pr.lookAhead(Pr.string('}}'))),
                        ),
                    );

                    // Normal block
                    if (!isElseBlock) {
                        const stmt: MustacheStatement = yield $mustache;
                        topOfStackStmts(stack).push(stmt);
                        break;
                    }

                    // Else outside blocks
                    if (stack.length <= 1) {
                        yield Pr.fail('{{else}} can only exist inside blocks');
                    }

                    const top = topOfStack(stack) as BlockStatement;

                    // Multiple else blocks
                    if (Array.isArray(top.elseStatements)) {
                        yield Pr.fail(`an {{else}} block was already defined for the block ${top.expression.path}`);
                    }

                    const stmt: MustacheStatement = yield Pr.optional($mustache);

                    // Simple else block (no nesting)
                    if (!stmt) {
                        top.elseStatements = [];
                        break;
                    }

                    // Else followed by literal
                    if (stmt.expression.type === 'LITERAL') {
                        yield Pr.fail('{{else}} blocks cannot have parameters');
                        // Never happens, just for typescript to know that below here, expression is not LiteralStatement
                        /* $lab:coverage:off$ */
                        break;
                        /* $lab:coverage:on$ */
                    }

                    // Else followed by variable
                    if (stmt.expression.type === 'VARIABLE') {
                        yield Pr.fail('{{else}} blocks cannot have variable parameters. Use "{{else if $var}}" instead.');
                        // Never happens, just for typescript to know that below here, expression is not VariableStatement
                        /* $lab:coverage:off$ */
                        break;
                        /* $lab:coverage:on$ */
                    }

                    // Nested block
                    top.elseStatements = [];
                    stack.push(buildBlock(open, stmt.expression, false, true));
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

    stripStandaloneLines(stack[0].statements, true, true);
    return stack[0];
}).map(({ type, ...v }, loc) => ({ type, loc, ...v }));
