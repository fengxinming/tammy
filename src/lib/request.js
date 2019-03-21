import isObject from 'celia/es/isObject';
import stringify from 'celia/es/qs/stringify';
import isAbsolute from 'celia/es/url/isAbsolute';
import joinURLs from 'celia/es/url/join';
import { toFormString, merge } from './util';
import { defaultHeaders, CONTENT_TYPES } from './defaults';

export default function (options) {
  let {
    url,
    baseURL,
    headers,
    method,
    contentType,
    params,
    data,
    adapter
  } = options;

  if (baseURL && !isAbsolute(url)) {
    url = options.url = joinURLs(baseURL, url);
  }

  method = options.method = method ? method.toUpperCase() : 'GET';

  // 合并headers
  headers = options.headers = merge({}, defaultHeaders.common, defaultHeaders[method], headers);
  let ctype;
  if ((ctype = contentType && CONTENT_TYPES[contentType])) {
    headers['Content-Type'] = ctype;
  }

  if (method === 'GET' && !params && isObject(data)) {
    // 避免在发送get请求时，把data属性当作params
    params = data;
    options.params = data;
    data = undefined;
  }
  if (isObject(params)) {
    params = stringify(params);
  }
  if (params) {
    url = options.url = url + (url.indexOf('?') > -1 ? '?' : '&') + params;
  }

  if (method === 'POST') {
    // 校验post数据格式
    ctype = headers['Content-Type'] || '';
    if (isObject(data)) {
      if (CONTENT_TYPES.json.indexOf(ctype) > -1) {
        data = JSON.stringify(data);
      } else {
        data = toFormString(data);
      }
      options.data = data;
    }
  }

  return adapter(options);
}
