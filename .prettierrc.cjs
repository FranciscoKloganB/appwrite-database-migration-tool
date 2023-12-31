// @ts-check

/** @type {import('@ianvs/prettier-plugin-sort-imports').PrettierConfig} */
module.exports = {
  bracketSpacing: true,
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  printWidth: 100,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  importOrder: ['<THIRD_PARTY_MODULES>', '', '^@cli(.*$)', '', '^@lib(.*$)', '', '^[./]', '^[../]'],
  importOrderParserPlugins: ['typescript', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.0.0',
};
