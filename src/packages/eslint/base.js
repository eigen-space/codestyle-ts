module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['unicorn', '@typescript-eslint'],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        project: 'tsconfig.json'
    },
    rules: {
        'key-spacing': 'error',
        'comma-spacing': 'error',
        'space-infix-ops': 'error',
        'space-before-blocks': 'error',
        'keyword-spacing': 'error',
        'comma-style': ['error', 'last'],
        'max-statements-per-line': ['error', { 'max': 1 }],
        'array-bracket-spacing': ['error', 'never'],
        'object-curly-spacing': ['error', 'always'],
        'brace-style': 'error',
        'max-len': [
            'error',
            {
                code: 120,
                ignoreComments: true,
                ignoreUrls: true,
                ignorePattern: '^import\\s.+\\sfrom\\s.+;$|^const\\s.+=\\srequire\(.+\);'
            }
        ],
        complexity: ['error', 10],
        'multiline-ternary': ['error', 'never'],
        'unicorn/filename-case': 'error',
        'capitalized-comments': ['error', 'always', { ignorePattern: 'tslint|noinspection|istanbul' }],
        'spaced-comment': ['error', 'always'],
        curly: 'error',
        'comma-dangle': ['error', 'never'],
        'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
        indent: ['error', 4, { SwitchCase: 1 }],
        '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
        'prefer-template': 'error',
        '@typescript-eslint/member-ordering': 'error',
        '@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: false }],
        'no-caller': 'error',
        'no-bitwise': 'error',
        'no-console': 'error',
        'no-new-wrappers': 'error',
        'constructor-super': 'error',
        'no-empty': 'error',
        'no-eval': 'error',
        '@typescript-eslint/no-inferrable-types': ['error', { ignoreParameters: true }],
        'no-shadow': 'error',
        'no-fallthrough': 'error',
        'default-case': 'error',
        'no-trailing-spaces': 'error',
        'no-undef-init': 'error',
        'no-unused-expressions': 'error',
        'no-var': 'error',
        'prefer-const': 'error',
        quotes: ['error', 'single'],
        radix: 'error',
        'no-throw-literal': 'error',
        '@typescript-eslint/semi': 'error',
        eqeqeq: ['error', 'always', { null: 'ignore' }],
        '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
        '@typescript-eslint/type-annotation-spacing': 'error',
        'yoda': ['error', 'never', { 'onlyEquality': true }],
        'no-else-return': 'error',
        'no-implicit-coercion': 'error',
        'no-extra-parens': 'error',
        'line-comment-position': [
            'error',
            { position: 'above' }
        ],
        'no-useless-constructor': 'error',
        'no-param-reassign': ['error', { props: true }]
    },
    overrides: [
        {
            plugins: ['eslint-plugin-prettier'],
            files: ['*.styles.ts'],
            rules: {
                indent: 'off',
                'prettier/prettier': ['error', {
                    trailingComma: 'none',
                    parser: 'typescript',
                    tabWidth: 4,
                    semi: true,
                    bracketSpacing: true,
                    printWidth: 120,
                    singleQuote: true
                }]
            }
        }
    ]
};
