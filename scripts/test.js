'use strict';

const { join } = require('path');
const { exec } = require('./util');

const cwd = process.cwd();

['tammy-adapter-xhr', 'tammy-plugin-xsrf', 'tammy-mock'].forEach(
  (packageName) => {
    process.chdir(join(__dirname, '..', 'packages', packageName));
    exec(['run', 'test']);
  }
);

process.chdir(cwd);
