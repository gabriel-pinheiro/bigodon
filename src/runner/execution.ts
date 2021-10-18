import { BigodonOptions } from "./options";

export class Execution {
    private constructor(
        // Context from which bigodon path expressions will evaluate
        public readonly contexts: object[],
        // Extra helpers that can be called other than default bigodon helpers
        public readonly extraHelpers: Map<string, Function>,
        // Data that cannot be accessed from the template but can be accessed and modified from helpers
        public readonly data?: object,
    ) { }

    get context(): object {
        return this.contexts[this.contexts.length - 1];
    }

    withChildContext(context: object): Execution {
        return new Execution([...this.contexts, context], this.extraHelpers);
    }

    static of(context: object, extraHelpers: Map<string, Function> = new Map(), options: BigodonOptions = {}): Execution {
        return new Execution([context], extraHelpers, options.data);
    }
}
