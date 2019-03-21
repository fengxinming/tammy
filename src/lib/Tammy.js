import append from 'celia/es/array/append';
import request from './request';
import response from './response';
import { merge, assign } from './util';
import defaults from './defaults';

// 内部拦截器
const internalInterceptors = [{
  fulfilled: request,
  rejected: undefined
}, {
  fulfilled: response,
  rejected: undefined
}];

export default class Tammy {

  constructor(options) {
    // 请求拦截
    this.reqInterceptors = [];
    // 响应拦截
    this.resInterceptors = [];
    // 合并参数
    this.options = options;
  }

  /**
   * 添加拦截器
   * @param {String} interceptors 拦截器名称
   * @param {Function} fulfilled 成功回调
   * @param {Function} rejected 异常回调
   */
  intercept(interceptors, fulfilled, rejected) {
    append(this[interceptors], { fulfilled, rejected });
    return this;
  }

  /**
   * http请求
   * @param {String|Object} url
   * @param {Object|undefined} options
   */
  request(opts) {
    // 合并全局参数
    opts = assign(merge({}, defaults), this.options, opts);

    let promise = Promise.resolve(opts);
    const interceptor = function ({ fulfilled, rejected }) {
      promise = promise.then(fulfilled, rejected);
    };
    this.reqInterceptors.forEach(interceptor);
    internalInterceptors.forEach(interceptor);
    this.resInterceptors.forEach(interceptor);
    return promise;
  }

}
