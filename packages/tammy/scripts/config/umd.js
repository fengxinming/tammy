'use strict';

const { resolve, releaseDir } = require('../util');
const pkg = require('../../package.json');

function configure(input, output) {
  return {
    isProd: true,
    inputOptions: {
      input
    },
    outputOptions: {
      name: pkg.name,
      file: output,
      format: 'umd',
      legacy: false,
      esModule: false
    }
  };
}

module.exports = [
  configure(resolve('src/index.js'), releaseDir('umd.js'))
];
