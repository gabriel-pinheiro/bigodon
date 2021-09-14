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
    params: ExpressionStatement[];
};

export type MustacheStatement = {
    type: 'MUSTACHE';
    expression: ExpressionStatement;
};

export type TemplateStatement = {
    type: 'TEMPLATE';
    statements: Statement[];
};

export type Statement = TextStatement | CommentStatement | ExpressionStatement | MustacheStatement | TemplateStatement;
