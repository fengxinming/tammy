import assign from 'celia/object/assign';
import request from './request';
import { assignDeep, interceptor } from './util';
import defaults from './defaults';
import xhr from './xhr';
import { CONTENT_TYPE } from './constants';
import { setHeader, mergeHeaders, transformContentType } from './header';

// 默认为客户端请求
defaults.adapter = xhr;

export default class Tammy {

  constructor(options) {
    // 拦截器
    this.interceptors = {
      request: interceptor([]),
      response: interceptor([])
    };
    // 内部钩子函数, 用于扩展插件
    this.internalHooks = {
      request: interceptor([]),
      response: interceptor([])
    };
    // 合并参数
    this.defaults = assignDeep({}, defaults, options);
  }

  /**
   * http请求
   * @param {Object} opts
   */
  request(opts) {
    // 合并全局参数
    opts = assign({}, this.defaults, opts);

    let { method, headers, contentType } = opts;
    method = opts.method = method ? method.toUpperCase() : 'GET';

    // 合并headers
    headers = opts.headers = mergeHeaders(headers, method);
    let ctype;
    if ((ctype = transformContentType(contentType))) {
      headers[CONTENT_TYPE] = ctype;
    }

    return request(opts, this.internalHooks, this.interceptors);
  }

}

/**
 * 设置全局headers
 * @param {String} key
 * @param {String} value
 * @param {String|undefined} method
 */
Tammy.prototype.setHeader = setHeader;
