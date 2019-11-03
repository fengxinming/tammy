'use strict';

const { resolve, releaseDir } = require('../util');

function configure(input, output) {
  const isDIR = Array.isArray(input);
  return {
    inputOptions: {
      input,
      external(id) {
        return /^(tammy)|(request)/.test(id);
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
  configure(resolve('src/index.js'), releaseDir('esm.js'))
];
