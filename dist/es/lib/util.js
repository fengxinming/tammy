import isNil from 'celia/es/isNil';
import forIn from 'celia/es/forIn';
import forEach from 'celia/es/forEach';
import append from 'celia/es/array/append';
import isObject from 'celia/es/isObject';

const rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg;

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

export function parseRawHeaders(rawHeaders) {
  const responseHeaders = {};
  let match;
  while ((match = rheaders.exec(rawHeaders))) {
    responseHeaders[match[1].toLowerCase()] = match[2];
  }
  return responseHeaders;
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

export const logErr = (console && console.error) || function () { };
