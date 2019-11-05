'use strict';

const { join } = require('path');
const { exec } = require('./util');

const cwd = process.cwd();
const [, , name, ...args] = process.argv;
const packages = ['tammy', 'tammy-adapter-xhr', 'tammy-plugin-xsrf', 'tammy-mock'];

packages.forEach(
  (packageName) => {
    if (name && name !== packageName) {
      return;
    }
    process.chdir(join(__dirname, '..', 'packages', packageName));
    exec(['run', 'build', ...args]);
  }
);

process.chdir(cwd);
