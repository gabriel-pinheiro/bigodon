import { $template } from './parser';
import { TemplateStatement } from './parser/statements';
import { run as _run } from './runner';
import { ensure } from './utils';

class Bigodon {
    private readonly helpers: Map<string, Function> = new Map();

    parse = (template: string): TemplateStatement => {
        ensure(typeof template === 'string', 'Template must be a string');
        return $template.parse(template);
    }

    run = async (ast: TemplateStatement, context?: object): Promise<string> => {
        return await _run(ast, context, this.helpers);
    }

    compile = (template: string): ((context?: object) => Promise<string>) => {
        const ast = this.parse(template);
        return (context?: object) => this.run(ast, context);
    }

    addHelper = (name: string, helper: Function): Bigodon => {
        ensure(typeof name === 'string', 'name must be a string');
        ensure(typeof helper === 'function', 'helper must be a function');

        this.helpers.set(name, helper);
        return this;
    }
}

const defaultBigodon = new Bigodon();

export const { parse, run, compile } = defaultBigodon;
export { TemplateStatement } from './parser/statements';
export default Bigodon;
