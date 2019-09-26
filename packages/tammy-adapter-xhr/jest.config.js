'use strict';

const { join } = require('path');

module.exports = {
  roots: [
    'test'
  ],
  verbose: false,
  // testEnvironment: 'node',
  testEnvironment: 'jsdom',
  testRegex: 'test/(.*/)*.*test.js$',
  coverageDirectory: './coverage/',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*'
  ],
  moduleNameMapper: {
    '^tammy$': join(__dirname, '..', 'tammy', 'src')
  },
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: []
};
