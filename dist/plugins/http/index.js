import Request from './Request';
import http from './http';

const toString = Object.prototype.toString;

function isStandardNodeEnv() {
  return process && toString.call(process) === '[object process]';
}

function plugin({ defaults }, $http) {
  if (isStandardNodeEnv()) {
    // For node use HTTP adapter
    defaults.adapter = http;
  }
}

plugin.Request = Request;

export default plugin;