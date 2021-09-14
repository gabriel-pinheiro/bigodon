import Pr, { Parser } from 'pierrejs';
import { ExpressionStatement } from './statements';
import { atPos, optionalSpaces, text } from './utils';

// TODO implement
export const $expression: Parser<ExpressionStatement> = Pr.fail('Uninplemented')
    .withName('expression');
