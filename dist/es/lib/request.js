import isObject from 'celia/es/isObject';
import isString from 'celia/es/isString';
import stringify from 'celia/es/qs/stringify';
import isAbsolute from 'celia/es/url/isAbsolute';
import joinURLs from 'celia/es/url/join';
import { toFormString, logErr, preloadHooks, joinQS, disableCache } from './util';

const CONTENT_TYPE = 'Content-Type';

function request(options) {
  let {
    url,
    cache,
    baseURL,
    headers,
    method,
    params,
    data,
    adapter
  } = options;

  if (baseURL && !isAbsolute(url)) {
    url = joinURLs(baseURL, url);
  }

  switch (method) {
    // case 'HEAD':
    case 'GET':
      if (!params) {
        // 避免在发送get请求时，把data属性当作params
        options.params = params = data;
        options.data = data = undefined;
      }
      break;
    case 'POST':
      // 校验post数据格式
      const ctype = headers[CONTENT_TYPE] || '';
      if (isObject(data)) {
        if (!ctype.indexOf('application/json')) {
          data = JSON.stringify(data);
        } else {
          data = toFormString(data);
        }
        options.data = data;
      }
      break;
  }

  if (params) {
    if (isObject(params)) {
      params = stringify(params);
    }
    url = joinQS(url, params);
  }
  if (cache === false && ['HEAD', 'GET'].indexOf(method) > -1) {
    url = disableCache(url);
  }

  options.url = url;

  return adapter(options).then((response) => {
    let { options, data } = response;
    if (options.responseType === 'json' && isString(data)) {
      try {
        response.data = JSON.parse(data);
      } catch (e) {
        logErr('parse data error: ', e);
      }
    }
    return response;
  });
}

/**
 * http请求
 * @param {Object} opts
 */
export default function (opts, reqHooks, resHooks) {
  let promise = Promise.resolve(opts);
  // 优先挂在全局钩子
  promise = preloadHooks(
    preloadHooks(promise, reqHooks).then(request),
    resHooks
  );
  return promise;
}
