import { preloadHooks, disableCache } from './helper';
import { isObject, formify, joinQS, stringify, isAbsolute, joinURLs } from './util';
import { CONTENT_TYPE } from './constants';

function request(options) {
  let {
    url,
    baseUrl,
    headers,
    method,
    qs,
    data,
    cache,
    adapter
  } = options;

  if (baseUrl && !isAbsolute(url)) {
    url = joinURLs(baseUrl, url);
  }

  switch (method) {
    case 'HEAD':
    case 'DELETE':
    case 'GET':
      if (!qs) {
        // 避免在发送get请求时，把data属性当作querystring
        options.qs = qs = data;
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
          data = formify(data);
        }
        options.data = data;
      }
      break;
  }

  if (qs) {
    if (isObject(qs)) {
      qs = stringify(qs);
    }
    url = joinQS(url, qs);
  }
  if (cache === false && ['HEAD', 'DELETE', 'GET'].indexOf(method) > -1) {
    url = disableCache(url);
  }

  options.url = url;

  return adapter(options);
}

/**
 * http请求
 * @param {Object} opts
 * @param {Array} internalHooks
 * @param {Array} interceptors
 */
export default function (opts, internalHooks, interceptors) {
  // 优先挂在全局钩子
  return preloadHooks(
    Promise.resolve(opts),
    interceptors.request,
    internalHooks.request,
    [request],
    internalHooks.response,
    interceptors.response
  );
}
