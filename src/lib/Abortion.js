import isObject from 'celia/es/isObject';
import append from 'celia/es/array/append';
import { createError } from './util';

export default class Abortion {

  constructor() {
    this.queue = [];
  }

  abort(anything) {
    let options;
    if (!anything) {
      anything = 'Request aborted';
    } else if (isObject(anything)) {
      options = anything;
      anything = anything.message || '';
    }
    let fn;
    while ((fn = this.queue.shift())) {
      fn(createError(anything, options));
    }
  }

  add(fn) {
    append(this.queue, fn);
    return this;
  }

  clear() {
    this.queue = [];
    return this;
  }

  pipe(abortion) {
    if (abortion && abortion.queue) {
      this.queue.forEach((fn) => {
        append(abortion.queue, fn);
      });
      this.clear();
    }
    return this;
  }

}
