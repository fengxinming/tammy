import { isObject, forOwn, assign, forSlice, removeAt, append, joinQS } from './util';
import { ECONNRESET, ENETWORK, ECONNABORTED } from './constants';

/**
 * 创建异常
 * @param {String} message
 * @param {Object} options
 */
export function createError(message, options) {
  const error = new Error(message);
  assign(error, options);
  return error;
}

/**
 * 序列化header
 * @param {Object} headers
 * @param {String} normalizedName
 */
export function normalizeHeaderName(headers, normalizedName) {
  forOwn(headers, (value, name) => {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
}

/**
 * 挂在hooks
 * @param {Promise} promise
 */
export function preloadHooks(promise) {
  forSlice(arguments, 1, (hooks) => {
    hooks.forEach((hook) => {
      promise = isObject(hook) ? promise.then(hook.fulfilled, hook.rejected) : promise.then(hook);
    });
  });
  return promise;
}

const RCACHE = /([?&]_=)[^&]*/;
let nonce = Date.now();
/**
 * 禁用get请求缓存
 * @param {String} url
 */
export function disableCache(url) {
  nonce++;
  const newUrl = url.replace(RCACHE, `$1${nonce}`);
  // url上未使用缓存标识
  if (newUrl === url) {
    url = joinQS(url, '_=' + nonce);
  }
  return url;
}

export const logErr = (console && console.error) || function () { };

/**
 * 扩展拦截器自定义方法
 * @param {Array} arr
 */
export function interceptor(arr) {
  arr.use = function (fulfilled, rejected) {
    return append(arr, { fulfilled, rejected });
  };
  arr.eject = function (index) {
    removeAt(index);
    return arr;
  };
  return arr;
}

/**
 * 创建网络状态异常
 * @param {Number} status
 * @param {Object} options
 */
export function createStatusError(status, options) {
  options.code = status;
  return createError(`Request failed with status code ${status}`, options);
}

/**
 * 创建超时异常
 * @param {Number} timeout
 * @param {Object} options
 */
export function createTimedoutError(timeout, options) {
  options.code = ECONNRESET;
  return createError(`Timeout of ${timeout}ms exceeded`, options);
}

/**
 * 创建网络请求异常
 * @param {String} message
 * @param {Object} options
 */
export function createNetworkError(message, options) {
  options.code = ENETWORK;
  return createError(message || 'Network Error', options);
}

/**
 * 创建主动中断请求异常
 * @param {String} message
 * @param {Object} options
 */
export function createAbortedError(message, options) {
  options.code = ECONNABORTED;
  return createError(message || 'Request aborted', options);
}

/**
 * 是否是主动中断请求异常
 * @param {Error} e
 */
export function isAborted(e) {
  return e && e.code === ECONNABORTED;
}
