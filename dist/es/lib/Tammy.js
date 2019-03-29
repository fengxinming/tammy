import request from './request';
import { deepAssign, assign, interceptor } from './util';
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
    // xhr钩子函数
    this.xhrHooks = {
      request: [],
      response: []
    };
    // 合并参数
    this.defaults = deepAssign({}, defaults, options);
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

    const { xhrHooks } = this;
    opts.xhrHooks = xhrHooks;
    return request(opts, xhrHooks.request, xhrHooks.response);
  }

}

/**
 * 设置全局headers
 * @param {String} key
 * @param {String} value
 * @param {String|undefined} method
 */
Tammy.prototype.setHeader = setHeader;
