import { uuid, remove, removeAt, isNumber, isNil } from './util';

class Interceptor {

  constructor(method) {
    this.ids = [];
    this.fns = Object.create(null);
    this.method = method;
  }

  /**
   * 添加拦截器
   * @param {Function} fulfilled
   * @param {Function|undefined} rejected
   * @returns {String} id
   */
  use(fulfilled, rejected) {
    const id = uuid();
    this.fns[id] = { fulfilled, rejected };
    this.ids[this.method](id);
    return id;
  }

  /**
   * 移除拦截器, 传入添加拦截器时返回的id
   * @param {String} id
   * @returns {Boolean} 是否移除
   */
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

  /**
   * 遍历使用拦截器
   * @param {Function} callback
   * @returns {Interceptor}
   */
  forEach(callback) {
    const { ids, fns } = this;
    ids.forEach((id) => {
      callback(fns[id]);
    });
    return this;
  }

}

/**
 * 获取请求和响应拦截器管理
 * @returns {Object}
 */
export default function () {
  return {
    request: new Interceptor('unshift'),
    response: new Interceptor('push')
  };
}
