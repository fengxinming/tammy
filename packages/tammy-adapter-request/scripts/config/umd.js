'use strict';

const { camelize } = require('celia');
const { resolve, releaseDir } = require('../util');
const pkg = require('../../package.json');

function configure(input, output) {
  return {
    isProd: true,
    inputOptions: {
      input,
      external(id) {
        return /^(tammy)|(request)/.test(id);
      }
    },
    outputOptions: {
      name: camelize(pkg.name),
      file: output,
      format: 'umd',
      legacy: false,
      esModule: false,
      globals: {
        tammy: 'tammy'
      }
    }
  };
}

module.exports = [
  configure(resolve('src/index.js'), releaseDir('umd.js'))
];
