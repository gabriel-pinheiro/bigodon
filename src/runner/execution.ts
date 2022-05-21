import { BigodonOptions } from './options';

/**
 * Template execution, holds contexts, extra helpers, data.
 */
export class Execution {
    /**
     * Template execution, holds contexts, extra helpers, data.
     *
     * @param {number} startMillis Timestamp of the template execution start
     * @param {object[]} contexts Contexts from which bigodon path expressions will evaluate
     * @param {Map<string, Function>} extraHelpers Extra helpers that can be called other than default bigodon helpers
     * @param {object?} data Data that cannot be accessed from the template but can be accessed and modified from helpers
     * @param {number} maxExecutionMillis Maximum milliseconds allowed for the template execution
     */
    private constructor(
        private readonly startMillis: number,

        public readonly contexts: object[],
        public readonly extraHelpers: Map<string, Function>,
        public readonly data: object,
        public readonly maxExecutionMillis: number,
    ) { }

    /**
     * Current context to be used by path expressions.
     *
     * @return {object} Current context to be used by path expressions.
     */
    get context(): object {
        return this.contexts[this.contexts.length - 1];
    }


    /**
     * Milliseconds since the template execution started.
     * @return {number} Milliseconds since the template execution started.
     */
    get elapsedMillis(): number {
        return Date.now() - this.startMillis;
    }

    /**
     * Creates Execution from current one with new child context.
     * Used to change context allowing for $parent and $root access of previous contexts.
     *
     * @param {object} context New child context to be used by path expressions
     * @return {Execution} Execution with the added context
     */
    withChildContext(context: object): Execution {
        return new Execution(
            this.startMillis,
            [...this.contexts, context],
            this.extraHelpers,
            this.data,
            this.maxExecutionMillis,
        );
    }

    /**
     * Creates an execution from context, helpers and options.
     *
     * @param {object} context Context from which bigodon path expressions will evaluate
     * @param {Map<string, Function>?} extraHelpers Extra helpers that can be called other than default bigodon helpers
     * @param {BigodonOptions} options Options for the current execution only
     * @return {Execution}
     */
    static of(context: object, extraHelpers: Map<string, Function> = new Map(), options: BigodonOptions = {}): Execution {
        return new Execution(
            Date.now(),
            [context],
            extraHelpers,
            options.data,
            options.maxExecutionMillis || Infinity,
        );
    }
}
