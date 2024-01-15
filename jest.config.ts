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
  collectCoverageFrom: ['src/lib/**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  coverageThreshold: {
    global: {
      functions: 80,
      lines: 60,
      statements: 60,
      branches: 50,
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
