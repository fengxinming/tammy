import { uuid, remove, removeAt, isNumber, isNil } from './util';

class Interceptor {

  constructor(method) {
    this.ids = [];
    this.fns = Object.create(null);
    this.method = method;
  }

  use(fulfilled, rejected) {
    const id = uuid();
    this.fns[id] = { fulfilled, rejected };
    this.ids[this.method](id);
    return id;
  }

  eject(id) {
    if (id) {
      const item = isNumber(id)
        ? removeAt(this.ids, id)
        : remove(this.ids, id);
      if (!isNil(item)) {
        delete this.fns[item];
        return true;
      }
    }
    return false;
  }

  forEach(callback) {
    const { ids, fns } = this;
    ids.forEach((id) => {
      callback(fns[id]);
    });
    return this;
  }

}

export default function () {
  return {
    request: new Interceptor('unshift'),
    response: new Interceptor('push')
  };
}
