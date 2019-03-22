'use strict';

const { resolve, DIST_FILENAME } = require('./_util');

function configure(input, output) {
  return {
    compress: true,
    inputOptions: {
      input: resolve(input)
      // experimentalCodeSplitting: true
    },
    outputOptions: {
      file: resolve(output),
      format: 'cjs',
      legacy: true,
      esModule: false
    }
  };
}

module.exports = [
  configure('src/index.js', `dist/${DIST_FILENAME}.legacy.js`)
];
