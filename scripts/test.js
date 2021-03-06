'use strict';

const { join } = require('path');
const { exec } = require('./util');

const cwd = process.cwd();
const [, , name, ...args] = process.argv;
const packages = ['tammy-adapter-xhr', 'tammy-adapter-request', 'tammy-plugin-xsrf', 'tammy-mock'];

packages.forEach(
  (packageName) => {
    if (name && name !== packageName) {
      return;
    }
    process.chdir(join(__dirname, '..', 'packages', packageName));
    exec(['run', 'test', ...args]);
  }
);

process.chdir(cwd);
