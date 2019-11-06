import isObject from 'celia/isObject';
import isNil from 'celia/isNil';
import isString from 'celia/isString';
import isFunction from 'celia/isFunction';
import isNumber from 'celia/isNumber';
import forOwn from 'celia/forOwn';
import stringifyQuery from 'qs-like/stringify';
import isAbsoluteURL from 'celia/isAbsoluteURL';
import joinPath from 'celia/joinPath';
import iterate from 'celia/_iterate';
import remove from 'celia/remove';
import removeAt from 'celia/removeAt';
import noop from 'celia/noop';
import { EREQCANCELLED, CONTENT_TYPES } from './constants';

export {
  isNil,
  isString,
  isObject,
  isFunction,
  isNumber,
  forOwn,
  remove,
  removeAt,
  stringifyQuery,
  isAbsoluteURL,
  joinPath,
  iterate,
  noop
};

/**
 * 深度合并
 * @param {Object} srcObj
 * @param {Object} destObj
 */
function _merge(srcObj, destObj) {
  forOwn(destObj, (val, key) => {
    let source = srcObj[key];
    if (isObject(source) && isObject(val)) {
      srcObj[key] = _merge(source, val);
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
export function merge(result) {
  iterate(arguments, 1, arguments.length, (arg) => {
    result = _merge(result, arg);
  });
  return result;
}

/**
 * 拼接querystring
 * @param {String} url
 * @param {String} qs
 */
export function joinQuery(url, qs) {
  return url + (url.indexOf('?') === -1 ? '?' : '&') + qs;
}

/**
 * 创建异常
 * @param {String} message
 * @param {Object} options
 */
export function createError(message, options) {
  const error = new Error(message);
  forOwn(options, (v, k) => {
    error[k] = v;
  });
  return error;
}

/**
 * 是否是主动中断请求异常
 * @param {Error} e
 */
export function isCancelled(e) {
  return e && e.code === EREQCANCELLED;
}

/**
 * 生成uuid
 */
export function uuid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
/**
 * 转换成真正的Content-Type
 * @param {String} type
 */

export function toContentType(type) {
  return type && CONTENT_TYPES[type];
}

/**
 * content type 转 request type
 * @param {String} contentType
 */
export function toRequestType(contentType) {
  if (contentType) {
    if (contentType.indexOf('application/x-www-form-urlencoded') === 0) {
      return 'form';
    } else if (contentType.indexOf('application/json') === 0) {
      return 'json';
    } else if (contentType.indexOf('multipart/form-data') === 0) {
      return 'form-data';
    }
  }
}
