import isObject from 'celia/isObject';
import isNil from 'celia/isNil';
import isString from 'celia/isString';
import isFunction from 'celia/isFunction';
import isNumber from 'celia/isNumber';
import forOwn from 'celia/forOwn';
import stringifyQuery from 'qs-like/stringify';
import isAbsoluteURL from 'celia/isAbsoluteURL';
import joinPath from 'celia/joinPath';
import loop from 'celia/_loop';
import remove from 'celia/remove';
import noop from 'celia/noop';
import { EREQCANCELLED } from './constants';

export {
  isNil,
  isString,
  isObject,
  isFunction,
  isNumber,
  forOwn,
  remove,
  stringifyQuery,
  isAbsoluteURL,
  joinPath,
  loop,
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
  loop(arguments, 1, arguments.length, (arg) => {
    result = _merge(result, arg);
  });
  return result;
}

/**
 * 对象转表单字符串
 * @param {Object} obj
 */
export function formify(obj) {
  const form = [];
  let i = 0;
  forOwn(obj, (val, key) => {
    form[i++] = `${key}=${val}`;
  });
  return form.join('&');
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

// /**
//  * 序列化header
//  * @param {Object} headers
//  * @param {String} normalizedName
//  */
// export function normalizeHeaderName(headers, normalizedName) {
//   forOwn(headers, (value, name) => {
//     if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
//       headers[normalizedName] = value;
//       delete headers[name];
//     }
//   });
// }

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
