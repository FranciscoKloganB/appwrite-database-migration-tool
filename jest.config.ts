import { pathsToModuleNameMapper, type JestConfigWithTsJest } from 'ts-jest';

import { compilerOptions } from './tsconfig.json';

const config: JestConfigWithTsJest = {
  verbose: true,
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s', '!src/index.ts'],
  coverageDirectory: '../coverage',
  coverageThreshold: {
    global: {
      lines: 90,
    },
  },
  modulePathIgnorePatterns: ['<rootDir>/app/', '<rootDir>/dist/'],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: '<rootDir>/',
    }),
    'tiny-invariant': '<rootDir>/node_modules/tiny-invariant/src/tiny-invariant.flow.js',
  },
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/jest.config.ts', '<rootDir>/src/index.ts'],
  transformIgnorePatterns: ['/node_modules/(?!tiny-invariant)'],
};

export default config;
