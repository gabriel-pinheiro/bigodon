import { arrayHelpers } from './array';
import { codeHelpers } from './code';
import { comparisonHelpers } from './comparison';
import { mathHelpers } from './math';
import { stringHelpers } from './string';

export const helpers = Object.assign(Object.create(null), {
    ...comparisonHelpers,
    ...stringHelpers,
    ...arrayHelpers,
    ...mathHelpers,
    ...codeHelpers,
});
