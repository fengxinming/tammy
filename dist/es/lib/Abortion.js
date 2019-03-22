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
    const { queue } = this;
    let fn;
    while ((fn = queue.shift())) {
      fn(createError(anything, options));
    }
  }

  add(fn) {
    append(this.queue, fn);
    return this;
  }

  clear() {
    this.queue.length = 0;
    return this;
  }

  pipe(abortion) {
    let queue;
    if (abortion && (queue = abortion.queue)) {
      let fn;
      while ((fn = queue.shift())) {
        append(queue, fn);
      }
    }
    return this;
  }

}
