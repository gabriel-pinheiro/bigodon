import { $template } from './parser';
import { TemplateStatement } from './parser/statements';
import { run as _run } from './runner';
import { BigodonOptions } from './runner/options';
import { ensure } from './utils';

class Bigodon {
    private readonly helpers: Map<string, Function> = new Map();

    /** Parses a template and returns an AST representing it. This can be persisted as JSON for later usage. */
    parse = (template: string): TemplateStatement => {
        ensure(typeof template === 'string', 'Template must be a string');
        return $template.parse(template);
    }

    /** Runs an AST returned by the {@link Bigodon#parse} method. */
    run = async (ast: TemplateStatement, context?: object, options?: BigodonOptions): Promise<string> => {
        return await _run(ast, context, this.helpers, options);
    }

    /** Compiles a template and returns a function that, when called, executes it */
    compile = (template: string): ((context?: object, options?: BigodonOptions) => Promise<string>) => {
        const ast = this.parse(template);
        return (context?: object, options?: BigodonOptions) => this.run(ast, context, options);
    }

    addHelper = (name: string, helper: Function): Bigodon => {
        ensure(typeof name === 'string', 'name must be a string');
        ensure(typeof helper === 'function', 'helper must be a function');

        this.helpers.set(name, helper);
        return this;
    }
}

const defaultBigodon = new Bigodon();

/** Parses a template and returns an AST representing it. This can be persisted as JSON for later usage. */
export const { parse } = defaultBigodon;

/** Runs an AST returned by the {@link parse} method. */
export const { run } = defaultBigodon;

/** Compiles a template and returns a function that, when called, executes it */
export const { compile } = defaultBigodon;

export { TemplateStatement } from './parser/statements';
export { BigodonOptions } from './runner/options';
export default Bigodon;
