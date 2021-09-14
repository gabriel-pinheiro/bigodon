import Pr, { Parser } from 'pierrejs';
import { LiteralStatement } from './statements';

export const lNull = Pr.string('null')
        .map(() => null);

export const lUndefined = Pr.string('undefined')
        .map(() => void 0);

export const lBoolean = Pr.oneOf(Pr.string('true'), Pr.string('false'))
        .map(s => s === 'true')
        .withName('boolean');

export const lNumber = Pr.fail('Unimplemented');
export const lString = Pr.fail('Unimplemented');

export const $literal: Parser<LiteralStatement> = Pr.oneOf(lNull, lUndefined, lBoolean, lNumber, lString)
        .map((value): LiteralStatement => ({ type: 'LITERAL', value }))
        .withName('literal');
