import { arrayHelpers } from "./array";
import { comparisonHelpers } from "./comparison";
import { stringHelpers } from "./string";

export const helpers = Object.assign(Object.create(null), {
    ...comparisonHelpers,
    ...stringHelpers,
    ...arrayHelpers,
});
