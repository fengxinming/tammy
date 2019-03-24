import isNil from 'celia/es/isNil';
import isObject from 'celia/es/isObject';
import forIn from 'celia/es/forIn';
import forEach from 'celia/es/forEach';
import append from 'celia/es/array/append';
import removeAt from 'celia/es/array/removeAt';

/**
 * 派生对象
 * @param {Object} target
 * @param {...Object}
 */
export const assign = Object.assign || function (target) {
  if (isNil(target)) {
    throw new TypeError('Cannot convert undefined or null to object');
  }
  const to = Object(target);
  const args = arguments;
  forEach(args, (nextSource) => {
    forIn(nextSource, (nextValue, nextKey) => {
      to[nextKey] = nextValue;
    });
  });
  return to;
};

/**
 * 合并对象
 * @param {Object} result
 * @param  {...Object} args
 */
export function merge(result, ...args) {
  function cb(val, key) {
    if (isObject(val)) {
      let source = result[key];
      source = isObject(source) ? source : {};
      result[key] = merge(source, val);
    } else {
      result[key] = val;
    }
  }
  forEach(args, (arg) => {
    forIn(arg, cb);
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
  forIn(headers, (value, name) => {
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
  forIn(obj, (val, key) => {
    append(form, `${key}=${val}`);
  });
  return form.join('&');
}

/**
 * 挂在hooks
 * @param {Promise} promise
 * @param {Array} hooks
 */
export function preloadHooks(promise, hooks) {
  hooks.forEach(({ fulfilled, rejected }) => {
    promise = promise.then(fulfilled, rejected);
  });
  return promise;
}

/**
 * 拼接querystring
 * @param {String} url
 * @param {String} qs
 */
export function joinQS(url, qs) {
  return url + (url.indexOf('?') > -1 ? '?' : '&') + qs;
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

export function interceptor(arr) {
  arr.use = function (fulfilled, rejected) {
    append(arr, { fulfilled, rejected });
    return arr;
  };
  arr.eject = function (index) {
    removeAt(index);
    return arr;
  };
  return arr;
}
