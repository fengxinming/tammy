'use strict';

const { join } = require('path');
const { exec } = require('./util');

const [, , name, ...args] = process.argv;
const packages = ['tammy', 'tammy-adapter-xhr', 'tammy-adapter-request', 'tammy-plugin-xsrf', 'tammy-mock'];

packages.forEach(
  (packageName) => {
    if (name && name !== packageName) {
      return;
    }
    exec(['publish', join(__dirname, '..', 'packages', packageName, 'npm'), ...args], true);
  }
);
