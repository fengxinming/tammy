import {
  forOwn, isNil, isString, isFunction, createError, joinQuery,
  ECONNRESET, ENETWORK, ECONNABORTED, CONTENT_TYPE
} from 'tammy';

const RHEADERS = /^(.*?):[ \t]*([^\r\n]*)$/mg;
const RCACHE = /([?&])_=[^&]*/;
// const RHASH = /#.*$/;
let nonce = Date.now();
const warn = (console && (console.warn || console.log)) || function () { };

/**
 * 解析 response headers
 * @param {XMLHttpRequest} request
 * @param {Object} response
 */
function parseRawHeaders(request, response) {
  Object.defineProperty(response, 'headers', {
    get() {
      if (!this._headers) {
        if (request && request.getAllResponseHeaders) {
          const rawHeaders = request.getAllResponseHeaders();
          const parsedHeaders = {};
          let match;
          while ((match = RHEADERS.exec(rawHeaders))) {
            parsedHeaders[match[1].toLowerCase()] = match[2];
          }
          this._headers = parsedHeaders;
        }
      }
      return this._headers;
    }
  });
}

export default function (config) {
  return new Promise((resolve, reject) => {
    const {
      method,
      data,
      headers,
      auth,
      cache,
      async,
      timeout,
      responseType,
      cancelToken,
      onDownloadProgress,
      onUploadProgress
    } = config;

    let { url } = config;

    // 防止浏览器缓存get请求
    if ((method === 'GET' || method === 'HEAD') && cache === false) {
      url = joinQuery(url.replace(RCACHE, '$1'), '_=' + (++nonce));
    }

    // HTTP basic authentication
    if (auth) {
      const username = auth.username || '';
      const password = auth.password || '';
      headers.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    // 异步请求对象
    let request = new XMLHttpRequest();

    // 建立连接
    request.open(method, url, async !== false);

    // 设置超时毫秒数
    request.timeout = timeout;

    // 监听异步返回状态
    request.onreadystatechange = function () {
      if (!request || request.readyState !== 4) {
        return;
      }

      const { status, responseURL } = request;

      // 状态为0，或者没有内容返回
      if (status === 0 && !(responseURL && responseURL.indexOf('file:') === 0)) {
        return;
      }

      // 处理响应
      let responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      const response = {
        data: responseData,
        statusText: request.statusText,
        status,
        config,
        request
      };

      parseRawHeaders(request, response);

      if (config.validateStatus(status)) {
        if (responseType === 'json' && isString(responseData)) {
          try {
            response.data = JSON.parse(responseData);
          } catch (e) {
            warn('Parse data error: ', e);
          }
        }
        resolve(response);
      } else {
        const err = createError(`Request failed with status code ${status}`, response);
        err.code = status;
        reject(err);
      }

      request = null;
    };

    // 监听请求中断
    request.onabort = function () {
      if (!request) {
        return;
      }

      createError('Request aborted', {
        code: ECONNABORTED,
        config,
        request
      });

      request = null;
    };

    // 监听网络错误
    request.onerror = function () {
      reject(createError('Network Error', {
        code: ENETWORK,
        config,
        request
      }));

      request = null;
    };

    // 监听超时处理
    request.ontimeout = function () {
      reject(createError(`Timeout of ${timeout}ms exceeded`, {
        code: ECONNRESET,
        config,
        request
      }));

      request = null;
    };

    // 增加 headers
    if (isFunction(request.setRequestHeader)) {
      forOwn(headers, (val, key) => {
        if (isNil(data) && key === CONTENT_TYPE) {
          // 如果data为空，就移除content-type
          delete headers[key];
        } else {
          request.setRequestHeader(key, val);
        }
      });
    }

    // 设置跨域
    if (config.withCredentials) {
      request.withCredentials = true;
    }

    // 设置返回的数据类型，IE >= 10
    if (responseType) {
      try {
        request.responseType = responseType || '';
      } catch (e) {
        warn('responseType error: ', e);
      }
    }

    if (isFunction(onDownloadProgress)) {
      request.addEventListener('progress', onDownloadProgress);
    }

    if (isFunction(onUploadProgress) && request.upload) {
      request.upload.addEventListener('progress', onUploadProgress);
    }

    cancelToken.subscribe((reason) => {
      if (!request) {
        return;
      }

      reason.config = config;
      reason.request = request;
      request.abort();
      reject(reason);
      request = null;
    });

    // 发送数据到服务端
    request.send(data === undefined ? null : data);

  });
}
