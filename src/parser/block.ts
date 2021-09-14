import Pr, { Parser } from "pierrejs";
import { Statement } from "./statements";

export const $block: Parser<Statement> = Pr.fail('Unimplemented').withName('block');
