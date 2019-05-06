import { assign } from './util';

export const CONTENT_TYPES = {
  json: 'application/json; charset=utf-8',
  form: 'application/x-www-form-urlencoded; charset=utf-8',
  'form-data': 'multipart/form-data; charset=utf-8'
};

const DEFAULT_POST_HEADERS = {
  'Content-Type': CONTENT_TYPES.form
};

const defaultHeaders = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

['DELETE', 'GET', 'HEAD'].forEach((method) => {
  defaultHeaders[method] = {};
});

['POST', 'PUT', 'PATCH'].forEach((method) => {
  defaultHeaders[method] = assign({}, DEFAULT_POST_HEADERS);
});

/**
 * 设置全局headers
 * @param {String} key
 * @param {String} value
 * @param {String|undefined} method
 */
export function setHeader(key, value, method) {
  method = method ? method.toUpperCase() : 'common';
  if (key === 'Content-Type') {
    value = CONTENT_TYPES[value] || value;
  }
  (defaultHeaders[method] || defaultHeaders.common)[key] = value;
  return this;
}

/**
 * 合并headers
 * @param {Object} headers
 */
export function mergeHeaders(headers, method) {
  return assign({}, defaultHeaders.common, defaultHeaders[method], headers);
}

/**
 * json、form、multipart 或者实际的contentType
 * @param {String} contentType
 */
export function transformContentType(contentType) {
  return contentType && CONTENT_TYPES[contentType];
}
