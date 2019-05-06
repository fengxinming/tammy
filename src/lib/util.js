import isObject from 'celia/isObject';
import isNil from 'celia/isNil';
import isString from 'celia/isString';
import isFunction from 'celia/isFunction';
import forOwn from 'celia/forOwn';
import stringify from 'celia/qs/stringify';
import isAbsolute from 'celia/url/isAbsolute';
import joinURLs from 'celia/url/join';
import assign from 'celia/object/assign';
import forSlice from 'kick-array/forSlice';
import append from 'kick-array/append';
import removeAt from 'kick-array/removeAt';

export {
  isNil,
  isString,
  isObject,
  isFunction,
  forOwn,
  assign,
  forSlice,
  append,
  removeAt,
  stringify,
  isAbsolute,
  joinURLs
};

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
 * 对象转表单字符串
 * @param {Object} obj
 */
export function formify(obj) {
  const form = [];
  forOwn(obj, (val, key) => {
    append(form, `${key}=${val}`);
  });
  return form.join('&');
}

/**
 * 拼接querystring
 * @param {String} url
 * @param {String} qs
 */
export function joinQS(url, qs) {
  return url + (url.indexOf('?') === -1 ? '?' : '&') + qs;
}
