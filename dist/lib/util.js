import 'celia/array/append.proto';
import isObject from 'celia/isObject';
import forOwn from 'celia/object/forOwn';
import forSlice from 'celia/array/forSlice';
import removeAt from 'celia/array/removeAt';
import assign from 'celia/object/assign';

import { ECONNRESET, ENETWORK } from './constants';

/**
 * 深度合并
 * @param {Object} srcObj
 * @param {Object} destObj
 */
export function mergeDeep(srcObj, destObj) {
  forOwn(destObj, (val, key) => {
    if (isObject(val)) {
      let source = srcObj[key];
      // 如果原对象对应的key值是对象，继续深度复制
      source = isObject(source) ? source : {};
      srcObj[key] = mergeDeep(source, val);
    } else {
      srcObj[key] = val;
    }
  });
  return srcObj;
}

/**
 * 合并对象
 * @param {Object} result
 */
export function assignDeep(result) {
  forSlice(arguments, 1, (arg) => {
    mergeDeep(result, arg);
  });
  return result;
}

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
 * 对象转表单字符串
 * @param {Object} obj
 */
export function toFormString(obj) {
  const form = [];
  forOwn(obj, (val, key) => {
    form.append(`${key}=${val}`);
  });
  return form.join('&');
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

/**
 * 拼接querystring
 * @param {String} url
 * @param {String} qs
 */
export function joinQS(url, qs) {
  return url + (url.indexOf('?') === -1 ? '?' : '&') + qs;
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
    return arr.append({ fulfilled, rejected });
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
  return createError(message || 'Network Error');
}
