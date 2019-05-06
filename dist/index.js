import * as util from './lib/util';
import Tammy from './lib/Tammy';
import { isAborted } from './lib/helper';
import { abort, abortAll } from './lib/abortion';

const { mergeDeep, isObject, assign } = util;

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
     * 挂载全局钩子
     * @param {Function} fn
     */
    use(fn) {
      if (!fn.installed) {
        fn(tammy, $http);
        fn.installed = true;
      }
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
     * 是否是中断异常
     */
    isAborted,

    /**
     * 中断请求
     * @param {String} token
     * @param {String} anything
     */
    abort(token, anything) {
      abort(token, anything);
      return $http;
    },

    /**
     * 中断所有的请求
     * @param {String} anything
     */
    abortAll(anything) {
      abortAll(anything);
      return $http;
    },

    /**
     * 常用方法
     */
    util
  });

  ['get', 'delete', 'head', 'options', 'post', 'put', 'patch'].forEach((method) => {
    $http[method] = function (url, data, options) {
      return $http(url, mergeDeep({ method, data }, options));
    };
  });

  $http.del = $http['delete'];

  return $http;
}

const instance = createInstance();

export default instance;
