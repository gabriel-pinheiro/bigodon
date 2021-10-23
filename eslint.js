module.exports = {
    'env': {
        'browser': true,
        'es2021': true,
        'node': true,
    },
    'extends': [
        'google',
    ],
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'ecmaVersion': 12,
        'sourceType': 'module',
    },
    'plugins': [
        '@typescript-eslint',
    ],
    'rules': {
        'indent': ['error', 4, {
            'FunctionDeclaration': { 'parameters': 'first' },
            'FunctionExpression': { 'parameters': 'first' },
            'SwitchCase': 1,
        }],
        'object-curly-spacing': ['error', 'always'],
        'require-jsdoc': ['error', {
            'require': {
                'FunctionDeclaration': false,
                'MethodDefinition': true,
                'ClassDeclaration': true,
                'ArrowFunctionExpression': false,
                'FunctionExpression': false,
            },
        }],
        'arrow-parens': ['error', 'as-needed'],
        'max-len': ['off'],
        'curly': ['off'],
    },
};
