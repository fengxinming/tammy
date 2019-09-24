import { forOwn, noop, uuid } from './util';

const tokens = Object.create(null);

class CancelToken {

  constructor() {
    this.id = uuid();
    this.state = 'pending'; // 初始状态
    this.callback = noop;
  }

  cancel(meta) {
    switch (this.state) {
      case 'pending': // 订阅前调用
        this.meta = meta;
        this.state = 'cancelled';
        break;
      case 'subscribed': // 订阅后调用
        this.state = 'finished';
        this.callback(meta);
        this.callback = noop;
        this.remove();
        break;
    }
  }

  subscribe(fn) {
    switch (this.state) {
      case 'cancelled': // 订阅前调用
        this.state = 'subscribed';
        this.cancel(this.meta);
        break;
      case 'pending': // 订阅后调用
        this.callback = fn;
        this.state = 'subscribed';
        break;
    }
    return this;
  }

  remove() {
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

export function cancel(id, meta) {
  if (id) {
    const token = tokens[id];
    if (token) {
      token.cancel(meta);
      delete tokens[id];
    }
  }
  return this;
}

export function cancelAll(meta) {
  forOwn(tokens, (token, id) => {
    token.cancel(meta);
    delete tokens[id];
  });
  return this;
}
