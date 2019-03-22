import isObject from 'celia/es/isObject';
import Tammy from './lib/Tammy';
import context from './lib/context';
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
     * 挂载全局钩子
     * @param {Function} fn
     */
    use(fn) {
      if (!fn.installed) {
        fn(context);
        fn.installed = true;
      }
      return $http;
    },

    /**
     * 拦截请求
     * @param {Function} fulfilled
     * @param {Function} rejected
     */
    hookRequest(fulfilled, rejected) {
      tammy.hook('reqHooks', fulfilled, rejected);
      return $http;
    },

    /**
     * 拦截响应
     * @param {Function} fulfilled
     * @param {Function} rejected
     */
    hookResponse(fulfilled, rejected) {
      tammy.hook('resHooks', fulfilled, rejected);
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
