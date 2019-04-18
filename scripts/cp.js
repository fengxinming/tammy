'use strict';

const { readdirSync, existsSync, mkdirSync } = require('fs');
const { join } = require('path');
const { exec } = require('child_process');
const { getLogger } = require('clrsole');
const { resolve } = require('./_util');

const logger = getLogger('celia');

function copyFile(command) {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      logger.error(error);
      throw error;
    }
    stdout && logger.info(stdout);
    stderr && logger.warn(stderr);
  });
}

module.exports = () => {
  const distDir = resolve('dist');
  if (!existsSync(distDir)) {
    mkdirSync(distDir);
  }
  copyFile(`cp ${resolve('package.json')} ${resolve('dist/package.json')}`);
  copyFile(`cp ${resolve('README.md')} ${resolve('dist/README.md')}`);
  const src = resolve('src');
  readdirSync(src).forEach((file) => {
    copyFile(`cp -r ${join(src, file)} ${join(distDir, file)}`);
  });
};
