import { $template } from './parser';
import { run } from './runner';

const parse = $template.parse.bind($template);
function compile(template: string): (context: object) => Promise<string> {
    const ast = parse(template);

    return (context: object) => run(ast, context);
}

export { compile, parse, run };
