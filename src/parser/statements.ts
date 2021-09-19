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

export type BlockStatement = {
    type: 'BLOCK';
    isNegated: boolean;
    expression: ExpressionStatement;
    statements: Statement[];
    elseStatements?: Statement[];
};

export type TemplateStatement = {
    type: 'TEMPLATE';
    version: number;
    statements: Statement[];
};

export type LiteralStatement = {
    type: 'LITERAL';
    value: string | number | boolean | null | undefined;
};

export type Statement = TextStatement | LiteralStatement | CommentStatement | BlockStatement |
                        ExpressionStatement | MustacheStatement | TemplateStatement;
