export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'hotfix',
        'perf',
        'poc',
        'refactor',
        'revert',
        'style',
        'test',
        'tidy',
        'wip',
      ],
    ],
  },
}
