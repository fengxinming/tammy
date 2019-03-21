import isObject from 'celia/es/isObject';
import Tammy from './lib/Tammy';
import defaults, { defaultHeaders, CONTENT_TYPES } from './lib/defaults';
import { merge, assign } from './lib/util';
import Abortion from './lib/Abortion';

function createInstance(options) {
  const tammy = new Tammy(options);

  /**
   * http请求服务
   * @param {String|Object} url
   * @param {Object|undefined} opts
   */
  const $http = function (url, opts) {
    if (isObject(url)) {
      opts = url;
      url = opts.url;
    } else {
      opts = opts || {};
      opts.url = url;
    }
    return tammy.request(opts);
  };

  assign($http, {
    /**
     * 中断请求
     */
    Abortion,
    /**
     * 设置全局默认配置
     */
    defaults,

    /**
     * 设置全局headers
     * @param {String} key
     * @param {String} value
     * @param {String|undefined} method
     */
    setDefaultHeader(key, value, method) {
      method = method ? method.toUpperCase() : 'common';
      if (key === 'Content-Type') {
        value = CONTENT_TYPES[value] || value;
      }
      (defaultHeaders[method] || defaultHeaders.common)[key] = value;
      return $http;
    },

    /**
     * 拦截请求
     * @param {Function} fulfilled
     * @param {Function} rejected
     */
    beforeRequest(fulfilled, rejected) {
      tammy.intercept('reqInterceptors', fulfilled, rejected);
      return $http;
    },

    /**
     * 拦截响应
     * @param {Function} fulfilled
     * @param {Function} rejected
     */
    afterResponse(fulfilled, rejected) {
      tammy.intercept('resInterceptors', fulfilled, rejected);
      return $http;
    },

    /**
     * 创建一个新实例
     * @param {Object} options
     */
    create(options) {
      return createInstance(options);
    },

    /**
     * 合并提交
     * @param  {Array} opts
     */
    all(opts) {
      return Promise.all(opts.map(opt => $http(opt)));
    },

    /**
     * 合并提交
     * @param  {...Object} opts
     */
    map(...opts) {
      return $http.all(opts);
    }
  });

  ['get', 'delete', 'head', 'options', 'post', 'put', 'patch'].forEach((method) => {
    $http[method] = function (url, data, options) {
      return $http(url, merge({ method, data }, options));
    };
  });

  return $http;
}

const instance = createInstance();

export default instance;
