export class Execution {
    private constructor(
        public readonly contexts: object[],
        public readonly extraHelpers: Map<string, Function>,
    ) { }

    get context(): object {
        return this.contexts[this.contexts.length - 1];
    }

    withChildContext(context: object): Execution {
        return new Execution([...this.contexts, context], this.extraHelpers);
    }

    static of(context: object, extraHelpers: Map<string, Function> = new Map()): Execution {
        return new Execution([context], extraHelpers);
    }
}
