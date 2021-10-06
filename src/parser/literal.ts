import Pr, { Parser } from 'pierrejs';
import { LiteralStatement } from './statements';
import { lString } from './string';

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

export const $literal: Parser<LiteralStatement> = Pr.either(lNull, lUndefined, lBoolean, lNumber, lString)
        .map((value): LiteralStatement => ({ type: 'LITERAL', value }))
        .withName('literal');
