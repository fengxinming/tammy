import isObject from 'celia/es/isObject';
import isString from 'celia/es/isString';
import stringify from 'celia/es/qs/stringify';
import isAbsolute from 'celia/es/url/isAbsolute';
import joinURLs from 'celia/es/url/join';
import append from 'celia/es/array/append';
import { toFormString, merge, assign, logErr, preloadHooks } from './util';
import defaults, { defaultHeaders, CONTENT_TYPES } from './defaults';
import context from './context';
import xhr from './xhr';

const { reqHooks, resHooks } = context;

// 默认为客户端请求
defaults.adapter = xhr;

function request(options) {
  let {
    url,
    baseURL,
    headers,
    method,
    contentType,
    params,
    data,
    adapter
  } = options;

  if (baseURL && !isAbsolute(url)) {
    url = options.url = joinURLs(baseURL, url);
  }

  method = options.method = method ? method.toUpperCase() : 'GET';

  // 合并headers
  headers = options.headers = merge({}, defaultHeaders.common, defaultHeaders[method], headers);
  let ctype;
  if ((ctype = contentType && CONTENT_TYPES[contentType])) {
    headers['Content-Type'] = ctype;
  }

  switch (method) {
    // case 'HEAD':
    case 'GET':
      if (!params) {
        // 避免在发送get请求时，把data属性当作params
        options.params = params = data;
        options.data = data = undefined;
      }
      break;
    case 'POST':
      // 校验post数据格式
      ctype = headers['Content-Type'] || '';
      if (isObject(data)) {
        if (!ctype.indexOf('application/json')) {
          data = JSON.stringify(data);
        } else {
          data = toFormString(data);
        }
        options.data = data;
      }
      break;
  }

  if (isObject(params)) {
    params = stringify(params);
  }
  if (isString(params)) {
    options.url = url + (url.indexOf('?') > -1 ? '?' : '&') + params;
  }

  return adapter(options).then((response) => {
    let { options, data } = response;
    if (options.responseType === 'json' && isString(data)) {
      try {
        response.data = JSON.parse(data);
      } catch (e) {
        logErr('parse data error: ', e);
      }
    }
    return response;
  });
}

export default class Tammy {

  constructor(options) {
    // 请求钩子
    this.reqHooks = [];
    // 响应钩子
    this.resHooks = [];
    // 合并参数
    this.options = options;
  }

  /**
   * 添加拦截器
   * @param {String} hookName 拦截器名称
   * @param {Function} fulfilled 成功回调
   * @param {Function} rejected 异常回调
   */
  hook(hookName, fulfilled, rejected) {
    append(this[hookName], { fulfilled, rejected });
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
    // 优先挂在全局钩子
    promise = preloadHooks(
      preloadHooks(
        preloadHooks(
          preloadHooks(promise, reqHooks),
          this.reqHooks
        ).then(request),
        resHooks
      ),
      this.resHooks
    );
    return promise;
  }

}
