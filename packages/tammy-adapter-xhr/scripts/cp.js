'use strict';

const { promisify } = require('util');
const { existsSync, mkdirSync } = require('fs');
const { copy } = require('fs-extra');
const { resolve, releaseDir } = require('./util');

const copify = promisify(copy);

module.exports = () => {
  const distDir = releaseDir();
  if (!existsSync(distDir)) {
    mkdirSync(distDir);
  }
  return Promise.all([
    copify(resolve('package.json'), releaseDir('package.json')),
    copify(resolve('README.md'), releaseDir('README.md'))
    // copify(resolve('src'), releaseDir('es'))
  ]);
};
