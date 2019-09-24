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
import xhr from './xhr';
import { CONTENT_TYPE, CONTENT_TYPES } from './constants';
import { getToken } from './cancel';
import interceptors from './interceptors';

const { stringify } = JSON;
const RCACHE = /([?&]_=)[^&]*/;
let nonce = Date.now();

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

  if (baseUrl && !isAbsoluteURL(url)) {
    url = joinPath(baseUrl, url);
  }

  // 参数处理
  switch (method) {
    case 'HEAD':
    case 'DELETE':
    case 'GET':
      if (!qs) {
        // 避免在发送get请求时，把data属性当作querystring
        config.qs = data;
        config.data = undefined;
      }
      break;
    case 'POST':
      // 校验post数据格式
      if (isObject(data)) {
        config.data = !(headers[CONTENT_TYPE] || '').indexOf('application/json')
          ? stringify(data)
          : formify(data);
      }
      break;
  }

  if (qs) {
    if (isObject(qs)) {
      qs = stringifyQuery(qs);
    }
    url = joinQuery(url, qs);
  }

  // 禁用缓存
  if (cache === false && ['HEAD', 'DELETE', 'GET'].indexOf(method) > -1) {
    nonce++;
    const newUrl = url.replace(RCACHE, `$1${nonce}`);
    // url上未使用缓存标识
    if (newUrl === url) {
      url = joinQuery(url, '_=' + nonce);
    }
  }

  config.url = url;

  return adapter(config);
}

export default class Tammy {

  constructor(options) {
    // 拦截器 钩子函数
    this.interceptors = interceptors();
    this.interceptors.request.use(dispatchRequest);

    // 合并参数
    this.defaults = merge({
      timeout: 0,
      responseType: 'json', // 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
      validateStatus(status) {
        return (status >= 200 && status < 300) || status === 304;
      },
      adapter: xhr
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
    interceptors.response.forEach(({ fulfilled, rejected }) => {
      promise = promise.then(fulfilled, rejected);
    });

    return promise;
  }

}
