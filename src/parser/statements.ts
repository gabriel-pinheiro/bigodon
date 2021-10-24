export type Location = {
    start: number;
    end: number;
};

export type TextStatement = {
    type: 'TEXT';
    loc: Location;
    value: string;
};

export type CommentStatement = {
    type: 'COMMENT';
    loc: Location;
    value: string;
};

export type ExpressionStatement = {
    type: 'EXPRESSION';
    loc: Location;
    path: string;
    params: (ExpressionStatement | LiteralStatement)[];
};

export type MustacheStatement = {
    type: 'MUSTACHE';
    loc: Location;
    expression: ExpressionStatement | LiteralStatement;
};

export type BlockStatement = {
    type: 'BLOCK';
    loc: Location;
    isNegated: boolean;
    expression: ExpressionStatement;
    statements: Statement[];
    elseStatements?: Statement[];
};

export type TemplateStatement = {
    type: 'TEMPLATE';
    loc: Location;
    version: number;
    statements: Statement[];
};

export type LiteralStatement = {
    type: 'LITERAL';
    loc: Location;
    value: string | number | boolean | null | undefined;
};

export type Statement = TextStatement | LiteralStatement | CommentStatement | BlockStatement |
                        ExpressionStatement | MustacheStatement | TemplateStatement;
