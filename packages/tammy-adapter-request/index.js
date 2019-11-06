'use strict';

const request = require('request');
const progress = require('request-progress');
const {
  forOwn, isString, isFunction, createError
} = require('tammy');

const filters = {
  baseUrl: true,
  qs: true,
  data: true,
  async: true,
  timeout: true,
  requestType: true,
  responseType: true,
  cancelToken: true,
  validateStatus: true,
  adapter: true,
  onDownloadProgress: true,
  onUploadProgress: true
};

/**
 * 重组请求参数
 * @param {Object} config
 */
function buildConfig(config) {
  const reqConfig = {};

  // 参数过滤
  forOwn(config, (val, key) => {
    if (!filters[key]) {
      reqConfig[key] = val;
    }
  });

  // 激活 request 默认超时时间
  const { timeout } = config;
  if (timeout > 0) {
    reqConfig.timeout = timeout;
  }

  return reqConfig;
}

module.exports = function (config) {
  return new Promise((resolve, reject) => {
    const reqConfig = buildConfig(config);
    const { requestType, onDownloadProgress, validateStatus, cancelToken } = config;
    switch (requestType) {
      case 'form':
        reqConfig.form = config.data;
        break;
      case 'json':
        reqConfig.body = config.data;
        break;
    }

    // 请求接口
    let req = (isFunction(onDownloadProgress)
      ? progress(request(reqConfig)).on('progress', onDownloadProgress)
      : request(reqConfig))
      .on('error', (err) => {
        if (!req) {
          return;
        }

        err.config = config;
        err.request = req;
        reject(err);
      })
      .on('response', (res) => {
        if (!req) {
          return;
        }

        req
          .once('complete', (res, body) => {
            const { statusCode } = res;
            // 处理响应结果
            if (config.responseType === 'json' && isString(body)) {
              try {
                body = JSON.parse(body);
              } catch (e) {
                console.error('Parse data error: ', e);
              }
            }

            // 构建响应结果
            const response = {
              data: body,
              statusText: res.statusMessage,
              status: statusCode,
              request: req,
              config
            };
            if (!validateStatus || validateStatus(statusCode)) {
              resolve(response);
            } else {
              const err = createError(`Request failed with status code ${statusCode}`, response);
              err.code = statusCode;
              reject(err);
            }

            req = null;
          })
          .readResponseBody(res);
      });

    cancelToken.subscribe((reason) => {
      if (!req) {
        return;
      }

      reason.config = config;
      reason.request = req;
      req.abort();
      reject(reason);
      req = null;
    });
  });
};
