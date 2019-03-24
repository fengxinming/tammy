import defaults, { defaultHeaders, CONTENT_TYPES } from './defaults';

export default {
  /**
   * 设置全局默认配置
   */
  defaults,

  /**
   * 处理xhr请求的钩子函数
   */
  xhrReqHooks: [],

  /**
   * 处理xhr响应的钩子函数
   */
  xhrResHooks: [],

  /**
   * 请求钩子
   */
  reqHooks: [],

  /**
   * 响应钩子
   */
  resHooks: [],

  /**
   * 设置全局headers
   * @param {String} key
   * @param {String} value
   * @param {String|undefined} method
   */
  setHeader(key, value, method) {
    method = method ? method.toUpperCase() : 'common';
    if (key === 'Content-Type') {
      value = CONTENT_TYPES[value] || value;
    }
    (defaultHeaders[method] || defaultHeaders.common)[key] = value;
    return this;
  }
};
