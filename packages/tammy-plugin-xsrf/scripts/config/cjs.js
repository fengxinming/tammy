'use strict';

const { resolve, releaseDir } = require('../util');

function configure(input, output) {
  const isDIR = Array.isArray(input);
  return {
    inputOptions: {
      input,
      external: (id) => {
        return /^tammy/.test(id);
      }
    },
    outputOptions: {
      dir: isDIR ? output : undefined,
      file: isDIR ? undefined : output,
      format: 'cjs',
      legacy: false,
      esModule: false
    }
  };
}

const srcDir = resolve('src');

module.exports = [
  configure(resolve(srcDir, 'index.js'), releaseDir('common.js'))
];
