import {
  merge,
  isFunction,
  isObject,
  isAbsoluteURL,
  joinPath,
  stringifyQuery,
  joinQuery,
  toContentType,
  toRequestType
} from './util';
import { CONTENT_TYPE, CT_FORM } from './constants';
import { getToken } from './cancel';
import interceptors from './interceptors';

const { stringify } = JSON;

/**
 * 请求接口
 * @param {Object} options
 */
function dispatchRequest(config) {
  const { baseUrl, headers, method, qs, data, adapter } = config;
  let { url, requestType } = config;

  // 拼接根路由
  if (baseUrl && !isAbsoluteURL(url)) {
    url = joinPath(baseUrl, url);
    delete config.baseUrl;
  }

  // 拼接查询参数
  if (qs) {
    url = joinQuery(url, isObject(qs) ? stringifyQuery(qs) : qs);
    delete config.qs;
  }

  // 参数处理
  switch (method) {
    case 'HEAD':
    case 'GET':
    case 'DELETE':
      // 兼容data参数
      if (data) {
        url = joinQuery(url, isObject(data) ? stringifyQuery(data) : data);
        delete config.data;
      }
      break;
    case 'POST':
      // 处理 requestType
      if (requestType) {
        const contentType = toContentType(requestType);
        if (contentType) {
          headers[CONTENT_TYPE] = contentType;
        }
      } else {
        config.requestType = requestType = toRequestType(headers[CONTENT_TYPE]);
      }
      // 校验post数据格式
      if (isObject(data)) {
        config.data = requestType === 'json'
          ? stringify(data)
          : stringifyQuery(data);
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
        'Content-Type': CT_FORM
      };
    });
  }

  /**
   * http请求服务
   * @param {String|Object} url
   * @param {Object|undefined} opts
   */
  fetch(url, opts) {
    // 统一参数
    if (isObject(url)) {
      opts = url;
    }

    // 合并全局参数
    opts = merge({ url }, this.defaults, opts);

    let { method, headers, cancelToken } = opts;

    method = method ? method.toUpperCase() : 'GET';

    // 合并headers
    headers = merge({}, this.headers.common, this.headers[method.toLowerCase()], headers);

    // 自定义保存cancelToken id
    const token = getToken();
    isFunction(cancelToken) && cancelToken(token.id);

    opts.baseUrl = opts.baseUrl || opts.baseURL;
    opts.qs = opts.qs || opts.params;
    opts.method = method;
    opts.headers = headers;
    opts.cancelToken = token;

    const { interceptors } = this;
    let promise = Promise.resolve(opts);
    const promisify = ({ fulfilled, rejected }) => {
      promise = promise.then(fulfilled, rejected);
    };
    interceptors.request.forEach((promisify));
    promise = promise.then(dispatchRequest);
    interceptors.response.forEach((promisify));

    return promise;
  }

}
