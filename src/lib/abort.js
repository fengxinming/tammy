import isObject from 'celia/es/isObject';
import { createError } from './util';
import forIn from 'celia/es/forIn';
import { ECONNRESET } from './constants';

export const managers = {};

function uuid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function buildError(anything) {
  let options = {};
  if (!anything) {
    anything = 'Request aborted';
  } else if (isObject(anything)) {
    options = anything;
    anything = anything.message || '';
  }
  options.code = ECONNRESET;
  return createError(anything, options);
}

export function abort(token, anything, ctx) {
  const fn = managers[token];
  fn(buildError(anything));
  delete managers[token];
  return ctx;
}

export function abortAll(anything, ctx) {
  forIn(managers, (fn, token) => {
    fn(buildError(anything));
    delete managers[token];
  });
  return ctx;
}

export function push(fn) {
  const token = uuid();
  managers[token] = fn;
  return token;
}

export function isAborted(e) {
  return e && e.code === ECONNRESET;
}
