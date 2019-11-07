'use strict';

const { join } = require('path');
const { exec } = require('./util');

const [, , name, ...args] = process.argv;

function publish(arr, getDir) {
  arr.forEach(
    (packageName) => {
      if (name && name !== packageName) {
        return;
      }
      exec(['publish', getDir(packageName), ...args], true);
    }
  );
}

const es6packages = [
  'tammy',
  'tammy-adapter-xhr',
  'tammy-plugin-xsrf',
  'tammy-mock'
];
publish(es6packages, packageName => join(__dirname, '..', 'packages', packageName, 'npm'));

const es5packages = [
  'tammy-adapter-request'
];
publish(es5packages, packageName => join(__dirname, '..', 'packages', packageName));
