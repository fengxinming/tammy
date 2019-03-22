'use strict';

const { resolve, DIST_FILENAME } = require('./_util');

function configure(input, output) {
  return {
    isProd: true,
    inputOptions: {
      input: resolve(input)
    },
    outputOptions: {
      file: resolve(output),
      format: 'umd',
      legacy: false,
      esModule: false
    }
  };
}

module.exports = [
  configure('src/index.js', `dist/${DIST_FILENAME}.js`)
];
