import Pr, { Parser } from 'pierrejs';
import { $block } from './block';
import { $expression } from './expression';
import { CommentStatement, Statement, TemplateStatement, TextStatement } from './statements';
import {
    atPos, closeMustache, openMustache,
    optionalSpaces, peek, text, char
} from './utils';

export const $text: Parser<Statement> = text
    .map((value): TextStatement => ({ type: 'TEXT', value }))
    .withName('text');

export const $comment: Parser<Statement> = Pr.all(char, text)
    .map(atPos(1))
    .map((value): CommentStatement => ({ type: 'COMMENT', value }))
    .withName('comment');

const mustache = $expression.map(expression => ({
    type: 'MUSTACHE',
    expression,
}));

export const $mustache = openMustache
    .pipe(() => peek)
    .pipe(char => {
        switch(char) {
            case '!': return $comment;
            case '#': return $block;
            case '^': return $block;
            case '/': return Pr.fail('Unexpected block end');
            default:  return mustache;
        }
    })
    .pipe(content => optionalSpaces.map(() => content))
    .pipe(content => closeMustache.map(() => content));

export const $statement: Parser<Statement> = Pr.either(
    $mustache,
    $text,
);

export const $template: Parser<TemplateStatement> = Pr.manyUntilEnd($statement)
    .map((statements): TemplateStatement => ({ type: 'TEMPLATE', statements }));
