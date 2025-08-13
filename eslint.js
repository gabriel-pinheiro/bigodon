const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');

module.exports = [
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 12,
                sourceType: 'module',
            },
            globals: {
                console: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                module: 'readonly',
                require: 'readonly',
                exports: 'readonly',
                global: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
        },
        rules: {
            'indent': ['error', 4, {
                'FunctionDeclaration': { 'parameters': 'first' },
                'FunctionExpression': { 'parameters': 'first' },
                'SwitchCase': 1,
            }],
            'object-curly-spacing': ['error', 'always'],
            'arrow-parens': ['error', 'as-needed'],
            'max-len': ['off'],
            'curly': ['off'],
            'camelcase': ['error'],
            'new-cap': ['error'],
            'no-trailing-spaces': ['error'],
            'eol-last': ['error'],
            'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
            'semi': ['error', 'always'],
            'no-var': ['error'],
            'prefer-const': ['error'],
        },
    },
];
