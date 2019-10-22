import Tammy from './Tammy';
import { merge } from './util';

/**
 * 创建 http 实例
 * @param {Object} options
 */
function createInstance(options) {
  const tammy = new Tammy(options);

  /**
   * http请求服务
   * @param {String|Object} url
   * @param {Object|undefined} opts
   */
  const $http = function (url, opts) {
    return tammy.request(url, opts);
  };

  /**
   * 挂载全局钩子
   * @param {Function} fn
   */
  $http.install = function (fn) {
    if (!fn._installed) {
      fn($http);
      fn._installed = true;
    }
    return $http;
  };

  /**
   * 合并提交
   * @param  {Array} opts
   */
  $http.all = function (opts) {
    return Promise.all(opts.map(opt => $http(opt)));
  };

  ['get', 'delete', 'head', 'options', 'post', 'put', 'patch'].forEach((method) => {
    $http[method] = function (url, data, options) {
      return $http(url, merge({ method, data }, options));
    };
  });

  $http.del = $http['delete'];
  $http.defaults = tammy.defaults;
  $http.headers = tammy.headers;
  $http.interceptors = tammy.interceptors;

  return $http;
}

/**
 * 创建一个新实例
 * @param {Object} options
 */
export function create(options) {
  return createInstance(options);
};

export const http = createInstance();
