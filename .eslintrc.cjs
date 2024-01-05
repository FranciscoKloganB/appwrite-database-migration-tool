// @ts-check

const noUnusedVarRule = [
  'error',
  {
    args: 'after-used',
    argsIgnorePattern: '^_|#error$|#log$|#info|databaseService$',
    ignoreRestSiblings: true,
    vars: 'all',
    varsIgnorePattern: '^_|#error$|#log$|#info|databaseService$',
  },
];

/** @type {import('eslint').Linter} */
module.exports = {
  env: {
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  overrides: [
    {
      files: './**/functions/**/*.{js,ts}',
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      files: './**/*.{spec,test}.{js,ts}',
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: '',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  root: true,
  rules: {
    '@typescript-eslint/no-unused-vars': noUnusedVarRule,
    'max-len': [
      'error',
      {
        code: 100,
        ignoreComments: true,
        ignorePattern: '^\\s*:?(class|text)=.*"$',
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreTrailingComments: true,
        ignoreUrls: true,
      },
    ],
    'no-unused-vars': 'off',
  },
};
