'use strict';

const { resolve, releaseDir } = require('../util');
const pkg = require('../../package.json');

function configure(input, output) {
  const isDIR = Array.isArray(input);
  return {
    inputOptions: {
      input,
      external: (id) => {
        return /^celia/.test(id);
      }
    },
    outputOptions: {
      dir: isDIR ? output : undefined,
      file: isDIR ? undefined : output,
      format: 'es'
    }
  };
}

module.exports = [
  configure(resolve('src/index.js'), releaseDir(pkg.name + '.esm.js'))
];
