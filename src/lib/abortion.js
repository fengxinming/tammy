import { isObject, forOwn } from './util';
import { createAbortedError } from './helper';

const abortions = {};

function uuid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function buildError(anything) {
  let options = {};
  if (isObject(anything)) {
    options = anything;
    anything = '';
  }
  return createAbortedError(anything, options);
}

class Abortion {

  constructor() {
    this.id = uuid();
    this.state = 0;
  }

  abort(err) {
    const { state } = this;
    this.state = 1;
    this.error = err;
    if (!state) {
      const { _abort } = this;
      if (_abort) {
        _abort();
        delete this._abort;
      }
    }
    this.remove();
  }

  push(fn) {
    if (this.state) {
      fn();
    } else {
      this._abort = fn;
    }
    return this;
  }

  remove() {
    delete abortions[this.id];
  }

}

export function get(token) {
  if (token) {
    return abortions[token];
  }
  const abortion = new Abortion();
  abortions[abortion.id] = abortion;
  return abortion;
}

export function remove(token) {
  if (isObject(token)) {
    token = token.id;
  }
  if (token) {
    delete abortions[token];
  }
}

export function abort(token, anything) {
  if (token) {
    const abortion = abortions[token];
    if (abortion) {
      abortion.abort(buildError(anything));
      delete abortions[token];
    }
  }
}

export function abortAll(anything) {
  const err = buildError(anything);
  forOwn(abortions, (abortion, token) => {
    abortion.abort(err);
    delete abortions[token];
  });
}
