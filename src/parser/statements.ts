export type TextStatement = {
    type: 'TEXT';
    value: string;
};

export type CommentStatement = {
    type: 'COMMENT';
    value: string;
};

export type ExpressionStatement = {
    type: 'EXPRESSION';
    path: string;
    params: (ExpressionStatement | LiteralStatement)[];
};

export type MustacheStatement = {
    type: 'MUSTACHE';
    expression: ExpressionStatement | LiteralStatement;
};

export type TemplateStatement = {
    type: 'TEMPLATE';
    statements: Statement[];
};

export type LiteralStatement = {
    type: 'LITERAL';
    value: string | number | boolean | null | undefined;
};

export type Statement = TextStatement | LiteralStatement | CommentStatement |
                        ExpressionStatement | MustacheStatement | TemplateStatement;
