import Pr from 'pierrejs';
import { char } from './utils';

/* $lab:coverage:off$ */
enum State {
    READ_CHAR,
    READ_ESCAPED_CHAR,
}
/* $lab:coverage:on$ */

const escapes = {
    '"': '"',
    '\'': '\'',
    '`': '`',
    '\\': '\\',
    'n': '\n',
    'r': '\r',
    't': '\t',
};

const doubleQuote = Pr.string('"').withName('double quotes');
const singleQuote = Pr.string('\'').withName('single quote');
const graveAccent = Pr.string('`').withName('grave accent');
const quote = Pr.oneOf(doubleQuote, singleQuote, graveAccent);

export const lString = Pr.context('string', function* () {
    const openQuote = yield quote;
    let state: State = State.READ_CHAR;
    let content = '';

    /* $lab:coverage:off$ */
    while (true) {
    /* $lab:coverage:on$ */
        switch (state) {
            case State.READ_CHAR: {
                const c = yield char;
                if (c === '\\') {
                    state = State.READ_ESCAPED_CHAR;
                    break;
                }

                if (c === openQuote) {
                    return content;
                }

                content += c;
                break;
            }

            case State.READ_ESCAPED_CHAR: {
                const c: string = yield char;
                content += escapes[c] || c;
                state = State.READ_CHAR;
                break;
            }

            /* $lab:coverage:off$ */
            default:
                yield Pr.fail(`Unexpected state ${state} at string parser`);
            /* $lab:coverage:on$ */
        }
    }
});
