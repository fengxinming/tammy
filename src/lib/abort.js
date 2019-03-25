import isObject from 'celia/es/isObject';
import isFunction from 'celia/es/isFunction';
import { createError } from './util';
import forIn from 'celia/es/forIn';

export const managers = {};

function uuid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function buildError(anything) {
  let options;
  if (!anything) {
    anything = 'Request aborted';
  } else if (isObject(anything)) {
    options = anything;
    anything = anything.message;
  }
  return createError(anything || '', options);
}

export function abort(token, anything, ctx) {
  const fn = managers[token];
  if (isFunction(fn)) {
    fn(buildError(anything));
    delete managers[token];
  }
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
