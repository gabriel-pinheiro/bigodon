import Pr, { Parser } from 'pierrejs';

export const join = (arr: string[]) => arr.join('');
export const atPos = (pos: number) => (arr: string[]) => arr[pos];
export const swap = (from: string, to: string) => Pr.string(from).map(() => to);

export const openMustache = Pr.string('{{');
export const closeMustache = Pr.string('}}');
export const escapedOpenMustache = Pr.string('\\{{').map(() => '{{');
export const escapedCloseMustache = Pr.string('\\}}').map(() => '}}');
export const escapedSlash = Pr.string('\\\\').map(() => '\\');

export const optionalSpaces = Pr.optional(Pr.spaces());
export const char = Pr.regex('char', /^./);
export const peek = Pr.lookAhead(char);


// TODO move to where this is used
export const text: Parser<string> = Pr.oneOrMany(Pr.either(
    escapedSlash,
    escapedOpenMustache,
    escapedCloseMustache,
    Pr.except(Pr.oneOf(closeMustache, openMustache)),
)).map(join);
