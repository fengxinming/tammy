import isObject from 'celia/isObject';
import { createError } from './util';
import forOwn from 'celia/object/forOwn';
import { ECONNABORTED } from './constants';

const MESSAGE = 'Request aborted';
export const managers = {};

function uuid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function buildError(anything) {
  let options = {};
  if (!anything) {
    anything = MESSAGE;
  } else if (isObject(anything)) {
    options = anything;
    anything = anything.message || MESSAGE;
  }
  options.code = ECONNABORTED;
  return createError(anything, options);
}

export function abort(token, anything, ctx) {
  const fn = managers[token];
  fn(buildError(anything));
  delete managers[token];
  return ctx;
}

export function abortAll(anything, ctx) {
  forOwn(managers, (fn, token) => {
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
  return e && e.code === ECONNABORTED;
}
