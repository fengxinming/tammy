'use strict';

const fs = require('fs');
const { exec } = require('child_process');
const { getConsole } = require('corie-logger');
const logger = getConsole('celia');
const { resolve } = require('./config/_util');

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
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
  }
  copyFile(`cp ${resolve('package.json')} ${resolve('dist/package.json')}`);
  copyFile(`cp ${resolve('README.md')} ${resolve('dist/README.md')}`);
  copyFile(`cp -r ${resolve('src/')} ${resolve('dist/es/')}`);
};
