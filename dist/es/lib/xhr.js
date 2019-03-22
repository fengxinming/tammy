import forIn from 'celia/es/forIn';
import isNil from 'celia/es/isNil';
import isFunction from 'celia/es/isFunction';
import { parseRawHeaders, createError, logErr, assign } from './util';
import context from './context';

const { xhrHeaderHooks } = context;

export default function (options) {
  return new Promise((resolve, reject) => {
    const {
      method,
      url,
      data,
      async,
      headers,
      timeout,
      responseType,
      onDownloadProgress,
      onUploadProgress,
      abortion,
      getAllResponseHeaders
    } = options;

    let request = new window.XMLHttpRequest();

    // 发送异步请求
    request.open(method, url, async !== false);

    // 设置超时毫秒数
    request.timeout = timeout || 0;

    // 监听异步返回状态
    request.onreadystatechange = function onreadystatechange() {
      if (!request || request.readyState !== 4) {
        return;
      }

      const { status, responseURL, responseText } = request;

      // 状态为0，或者没有内容返回
      if (status === 0 && !(responseURL && responseURL.indexOf('file:') === 0)) {
        return;
      }

      // 处理响应
      let responseData = (!responseType || responseType === 'text') ? request : (request.response || responseText);
      const response = {
        data: responseData,
        statusText: request.statusText,
        options,
        request,
        status
      };

      if (getAllResponseHeaders && 'getAllResponseHeaders' in request) {
        response.headers = parseRawHeaders(request.getAllResponseHeaders());
      }

      if (options.validateStatus(status)) {
        resolve(response);
      } else {
        reject(createError(`Request failed with status code ${status}`, response));
      }

      // 垃圾回收
      request = null;
    };

    // 监听请求中断
    request.onabort = function onabort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', assign({
        code: 'ECONNABORTED',
        options,
        request
      }, request.customError)));

      // 垃圾回收
      request = null;
    };

    // 监听网络错误
    request.onerror = function onerror() {
      reject(createError('Network Error', {
        options,
        request
      }));

      // 垃圾回收
      request = null;
    };

    // 监听超时处理
    request.ontimeout = function ontimeout() {
      reject(createError(`timeout of ${timeout}ms exceeded`, {
        code: 'ECONNABORTED',
        options,
        request
      }));

      // 垃圾回收
      request = null;
    };

    xhrHeaderHooks.forEach(cb => cb(options));

    // 增加 headers
    if ('setRequestHeader' in request) {
      forIn(headers, (val, key) => {
        if (isNil(data) && key === 'Content-Type') {
          // 如果data为空，就移除content-type
          delete headers[key];
        } else {
          request.setRequestHeader(key, val);
        }
      });
    }

    // 设置跨域
    if (options.withCredentials) {
      request.withCredentials = true;
    }

    // 设置返回的数据类型，IE >= 10
    if (responseType) {
      try {
        request.responseType = responseType;
      } catch (e) {
        logErr('responseType error: ', e);
      }
    }

    if (isFunction(onDownloadProgress)) {
      request.addEventListener('progress', onDownloadProgress);
    }

    if (isFunction(onUploadProgress) && request.upload) {
      request.upload.addEventListener('progress', onUploadProgress);
    }

    if (abortion) {
      abortion.add((error) => {
        request.customError = error;
        request.abort();
      });
    }

    // 发送数据到服务端
    request.send(data || null);

  });
}
