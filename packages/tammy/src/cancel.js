import { forOwn, noop, uuid, isObject, createError } from './util';
import { EREQCANCELLED } from './constants';

const tokens = Object.create(null);

class CancelToken {

  constructor() {
    this.id = uuid();
    this.state = 'pending'; // 初始状态
    this.callback = noop;
    this.reason = null;
  }

  cancel(reason) {
    reason = createError((isObject(reason) ? reason.message : reason) || 'Request cancelled', reason);
    reason.code = EREQCANCELLED;

    switch (this.state) {
      case 'pending': // 订阅前调用
        this.reason = reason;
        this.state = 'cancelled';
        break;
      case 'subscribed': // 订阅后调用
        this.remove();
        this.callback(reason);
        this.callback = noop;
        this.reason = null;
        break;
    }
  }

  throwIfRequested() {
    const { state } = this;
    this.remove();
    if (state === 'cancelled') {
      throw this.reason;
    }
  }

  subscribe(fn) {
    switch (this.state) {
      case 'cancelled': // 订阅前调用
        this.callback = fn;
        this.state = 'subscribed';
        this.cancel(this.reason);
        break;
      case 'pending': // 订阅后调用
        this.callback = fn;
        this.state = 'subscribed';
        break;
    }
    return this;
  }

  remove() {
    this.state = 'finished';
    delete tokens[this.id];
  }

}

export function getToken(id) {
  if (id) {
    return tokens[id];
  }
  const token = new CancelToken();
  tokens[token.id] = token;
  return token;
}

/**
 * 中断请求
 * @param {String} id
 * @param {any} reason
 */
export function cancel(id, reason) {
  let token;
  if (id && (token = tokens[id])) {
    token.cancel(reason);
  }
  return this;
}

/**
 * 中断所有的请求
 * @param {any} reason
 */
export function cancelAll(reason) {
  forOwn(tokens, (token, id) => {
    token.cancel(reason);
  });
  return this;
}
