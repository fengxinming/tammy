import { forOwn, isNil, isString, assign, isFunction } from './util';
import { logErr, createNetworkError, createTimedoutError, createStatusError } from './helper';
import { CONTENT_TYPE } from './constants';

export default function (options) {
  return new Promise((resolve, reject) => {
    const {
      method,
      url,
      data,
      async,
      timeout,
      responseType,
      onDownloadProgress,
      onUploadProgress,
      _abortion
    } = options;

    // 异步请求对象
    let request = new window.XMLHttpRequest();

    const gc = () => {
      _abortion.remove();
      request = null;
    };

    // 建立连接
    request.open(method, url, async !== false);

    // 设置超时毫秒数
    request.timeout = timeout || 0;

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
      let responseData = (!responseType || responseType === 'text') ? request : (request.response || request.responseText);
      const response = {
        data: responseData,
        statusText: request.statusText,
        options,
        request,
        status
      };

      if (options.validateStatus(status)) {
        if (responseType === 'json' && isString(responseData)) {
          try {
            response.data = JSON.parse(responseData);
          } catch (e) {
            logErr('Parse data error: ', e);
          }
        }
        resolve(response);
      } else {
        reject(createStatusError(status, response));
      }

      // 垃圾回收
      gc();
    };

    // 监听请求中断
    // request.onabort = function () {
    //   if (!request) {
    //     return;
    //   }
    //   reject(assign(_abortion.error, {
    //     options,
    //     request
    //   }));

    //   // 垃圾回收
    //   gc();
    // };

    // 监听网络错误
    request.onerror = function () {
      reject(createNetworkError(null, {
        options,
        request
      }));

      // 垃圾回收
      gc();
    };

    // 监听超时处理
    request.ontimeout = function () {
      reject(createTimedoutError(timeout, {
        options,
        request
      }));

      // 垃圾回收
      gc();
    };

    // 增加 headers
    const { headers } = options;
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
    if (options.withCredentials) {
      request.withCredentials = true;
    }

    // 设置返回的数据类型，IE >= 10
    if (responseType) {
      try {
        request.responseType = responseType || '';
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

    // 发送数据到服务端
    request.send(data || null);

    // 添加中断请求函数
    _abortion.push(() => {
      reject(assign(_abortion.error, {
        options,
        request
      }));
      request && request.abort();
      // 垃圾回收
      gc();
    });

  });
}
