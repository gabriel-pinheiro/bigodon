import Pr, { Parser } from 'pierrejs';
import { LiteralStatement } from './statements';
import { atPos, join, swap } from './utils';

export const lNull = Pr.string('null')
        .map(() => null)
        .withName('null');

export const lUndefined = Pr.string('undefined')
        .map(() => void 0)
        .withName('undefined');

export const lBoolean = Pr.oneOf(Pr.string('true'), Pr.string('false'))
        .map(s => s === 'true')
        .withName('boolean');

export const lNumber = Pr.regex('number', /^[+\-]?[0-9]+(\.[0-9]+)?/)
        .map(n => Number(n));

const quote = Pr.string('"').withName('quote');
const nonQuote = Pr.except(quote);
const escapedChar = Pr.all(
    Pr.string('\\'),
    Pr.oneOf(
        swap('"', '"'),
        swap('\\', '\\'),
        swap('n', '\n'),
        swap('t', '\t'),
    ),
).map(atPos(1));
const stringChar = Pr.oneOf(escapedChar, nonQuote);
const stringContent = Pr.many(stringChar).map(join);
const lString = Pr.all(quote, stringContent, quote)
    .map(atPos(1))
    .withName('string');

export const $literal: Parser<LiteralStatement> = Pr.either(lNull, lUndefined, lBoolean, lNumber, lString)
        .map((value): LiteralStatement => ({ type: 'LITERAL', value }))
        .withName('literal');
