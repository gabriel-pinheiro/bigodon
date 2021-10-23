import { $template } from './parser';
import { TemplateStatement } from './parser/statements';
import { run as _run } from './runner';
import { BigodonOptions } from './runner/options';
import { ensure } from './utils';

/**
 * @param {object?} context Context to be used when evaluating the template.
 * @param {BigodonOptions?} options Options to be used.
 * @return {Promise<string>} Promise that resolves to the rendered template.
 */
export type TemplateRunner =
    (context?: object, options?: BigodonOptions) => Promise<string>;

/**
 * Bigodon class, used if you need custom settings or helpers
 * not present in the default functions.
 */
class Bigodon {
    private readonly helpers: Map<string, Function> = new Map();

    /**
     * Parses a template and returns an AST representing it.
     * This can be persisted as JSON for later usage.
     *
     * @param {string} template Bigodon template to be parsed
     * @return {TemplateStatement} AST representing input template
     */
    parse = (template: string): TemplateStatement => {
        ensure(typeof template === 'string', 'Template must be a string');
        return $template.parse(template);
    };

    /**
     * Runs an AST returned by the {@link Bigodon#parse} method.
     *
     * @param {TemplateStatement} ast AST returned by {@link Bigodon#parse}.
     * @param {object?} context Context to be used when evaluating the template.
     * @param {BigodonOptions?} options Options to be used.
     * @return {Promise<string>} Promise that resolves to the rendered template.
     */
    run = async (ast: TemplateStatement,
                 context?: object,
                 options?: BigodonOptions): Promise<string> => {
        return await _run(ast, context, this.helpers, options);
    };

    /**
     * Compiles a template and returns a function that, when called, executes it
     *
     * @param {string} template Bigodon template to be parsed
     * @return {TemplateRunner} Function that executes the template
     */
    compile = (template: string): TemplateRunner => {
        const ast = this.parse(template);
        return (context?: object, options?: BigodonOptions) =>
            this.run(ast, context, options);
    };

    /**
     * Adds a helper to the Bigodon instance.
     *
     * @param {string} name Name of the helper when used in templates
     * @param {Function} helper Function to be executed when helper is called
     * @return {Bigodon} Returns the Bigodon instance for chaining
     */
    addHelper = (name: string, helper: Function): Bigodon => {
        ensure(typeof name === 'string', 'name must be a string');
        ensure(typeof helper === 'function', 'helper must be a function');

        this.helpers.set(name, helper);
        return this;
    };
}

const defaultBigodon = new Bigodon();

/**
 * Parses a template and returns an AST representing it.
 * This can be persisted as JSON for later usage.
 *
 * @param {string} template Bigodon template to be parsed
 * @return {TemplateStatement} AST representing input template
 */
export const { parse } = defaultBigodon;

/**
 * Runs an AST returned by the {@link parse} method.
 *
 * @param {TemplateStatement} ast AST returned by {@link parse}.
 * @param {object?} context Context to be used when evaluating the template.
 * @param {BigodonOptions?} options Options to be used.
 * @return {Promise<string>} Promise that resolves to the rendered template.
 */
export const { run } = defaultBigodon;

/**
 * Compiles a template and returns a function that, when called, executes it
 *
 * @param {string} template Bigodon template to be parsed
 * @return {TemplateRunner} Function that executes the template
 */
export const { compile } = defaultBigodon;

export { TemplateStatement } from './parser/statements';
export { BigodonOptions } from './runner/options';
export default Bigodon;
