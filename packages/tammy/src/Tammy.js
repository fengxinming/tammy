import {
  merge,
  isFunction,
  isObject,
  isAbsoluteURL,
  joinPath,
  formify,
  stringifyQuery,
  joinQuery
} from './util';
import { CONTENT_TYPE, CONTENT_TYPES } from './constants';
import { getToken } from './cancel';
import interceptors from './interceptors';

let nonce = Date.now();
const { stringify } = JSON;
const RCACHE = /([?&]_=)[^&]*/;
/**
 * 请求接口
 * @param {Object} options
 */
function dispatchRequest(config) {
  let {
    url,
    baseUrl,
    headers,
    method,
    qs,
    data,
    cache,
    adapter
  } = config;

  // 拼接根路由
  if (baseUrl && !isAbsoluteURL(url)) {
    url = joinPath(baseUrl, url);
  }

  // 拼接查询参数
  if (qs) {
    url = joinQuery(url, isObject(qs) ? stringifyQuery(qs) : qs);
  }

  // 参数处理
  switch (method) {
    case 'HEAD':
    case 'DELETE':
    case 'GET':
      // 兼容data参数
      if (data) {
        url = joinQuery(url, isObject(data) ? stringifyQuery(data) : data);
      }

      // 禁用缓存
      if (cache === false) {
        nonce++;
        const newUrl = url.replace(RCACHE, `$1${nonce}`);
        // url上未使用缓存标识
        if (newUrl === url) {
          url = joinQuery(url, '_=' + nonce);
        }
      }
      break;
    case 'POST':
    case 'PUT':
    case 'PATCH':
      // 校验post数据格式
      if (isObject(data)) {
        config.data = !(headers[CONTENT_TYPE] || '').indexOf('application/json')
          ? stringify(data)
          : formify(data);
      }
      break;
  }

  config.url = url;

  // 如果已经取消，需要抛出异常
  return adapter(config).then((res) => {
    config.cancelToken.throwIfRequested();
    delete config.cancelToken;
    return res;
  }, (err) => {
    config.cancelToken.throwIfRequested();
    delete config.cancelToken;
    return Promise.reject(err);
  });
}

export default class Tammy {

  constructor(options) {
    // 拦截器 钩子函数
    this.interceptors = interceptors();

    // 合并参数
    this.defaults = merge({
      timeout: 0,
      responseType: 'json', // 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
      validateStatus(status) {
        return (status >= 200 && status < 300) || status === 304;
      }
    }, options);

    const headers = this.headers = {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    };
    ['delete', 'get', 'head'].forEach((method) => {
      headers[method] = {};
    });

    ['post', 'put', 'patch'].forEach((method) => {
      headers[method] = {
        'Content-Type': CONTENT_TYPES.form
      };
    });
  }

  /**
   * http请求服务
   * @param {String|Object} url
   * @param {Object|undefined} opts
   */
  request(url, opts) {
    // 统一参数
    if (isObject(url)) {
      opts = url;
    }

    // 合并全局参数
    opts = merge({ url }, this.defaults, opts);

    let { method, headers, contentType, cancelToken } = opts;
    method = method ? method.toUpperCase() : 'GET';

    // 合并headers
    headers = merge({}, this.headers.common, this.headers[method], headers);
    if ((contentType = contentType && CONTENT_TYPES[contentType])) {
      headers[CONTENT_TYPE] = contentType;
    }

    const _cancelToken = getToken();

    if (isFunction(cancelToken)) {
      cancelToken(_cancelToken.id);
    }

    opts.method = method;
    opts.headers = headers;
    opts.cancelToken = _cancelToken;

    const { interceptors } = this;
    let promise = Promise.resolve(opts);
    interceptors.request.forEach(({ fulfilled, rejected }) => {
      promise = promise.then(fulfilled, rejected);
    });
    promise = promise.then(dispatchRequest);
    interceptors.response.forEach(({ fulfilled, rejected }) => {
      promise = promise.then(fulfilled, rejected);
    });

    return promise;
  }

}
