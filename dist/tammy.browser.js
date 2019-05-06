/*!
 * tammy.js v1.0.0
 * (c) 2018-2019 Jesse Feng
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.tammy = factory());
}(this, function () { 'use strict';

  function isNil (value) {
    /* eslint eqeqeq: 0 */
    return value == null;
  }

  function isObject (value) {
    return !isNil(value) && typeof value === 'object';
  }

  function isString (value) {
    return typeof value === 'string';
  }

  function isFunction (value) {
    return typeof value === 'function';
  }

  function iteratorCallback (iterator, context) {
    return context ? iterator.bind(context) : iterator;
  }

  function _for (handler, value, iterator, context) {
    var cb = iteratorCallback(iterator, context);
    for (var key in value) {
      if (handler(cb, value[key], key)) {
        break;
      }  }
  }

  function forOwn (value, iterator, context) {
    _for(
      function (cb, val, key) { return value.hasOwnProperty(key) && cb(val, key, value) === false; },
      value, iterator, context
    );
  }

  function forOwn$1 (value, iterator, context) {
    return isObject(value) && forOwn(value, iterator, context);
  }

  function append (arr, obj) {
    arr[arr.length] = obj;
    return arr;
  }

  function stringify(obj, sep, eq) {
    if ( sep === void 0 ) sep = '&';
    if ( eq === void 0 ) eq = '=';

    var arr = [];
    forOwn$1(obj, function (value, key) {
      if (!value && (isNil(value) || isNaN(value))) {
        value = '';
      }
      append(arr, encodeURIComponent(key) + eq + encodeURIComponent(value));
    });
    return arr.length ? arr.join(sep) : '';
  }

  function isAbsolute (url) {
    return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
  }

  function forSlice (value, start, end, iterator, context) {
    var cb = iteratorCallback(iterator, context);
    for (var i = start, returnValue = (void 0); returnValue !== false && i < end; i++) {
      returnValue = cb(value[i], i, value);
    }
  }

  function joinURLs (baseURL) {
    var len = arguments.length;
    if (!isNil(baseURL)) {
      baseURL = baseURL.replace(/\/+$/, '');
    } else if (len > 1) {
      baseURL = '';
    }
    var str = '';
    forSlice(arguments, 1, len, function (arg) {
      if (arg) {
        str += '/';
        str += arg;
      }
    });
    if (str) {
      baseURL += str.replace(/\/+/g, '/');
    }
    return baseURL;
  }

  var assign = Object.assign || function (target) {
    if (isNil(target)) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);

    forSlice(arguments, 1, arguments.length, function (nextSource) {

      forOwn$1(nextSource, function (nextVal, nextKey) {
        to[nextKey] = nextVal;
      });

    });
    return to;
  };

  function max(a, b) {
    return a >= b ? a : b;
  }

  function compareIndex (fromIndex, length) {
    return fromIndex < 0 ? max(0, length + fromIndex) : fromIndex;
  }

  function forSlice$1 (value, start, end, iterator, context) {
    var len = value.length;
    if (isFunction(end)) {
      context = iterator;
      iterator = end;
      end = len;
    } else {
      end = compareIndex(end, len);
    }
    start = compareIndex(start, len);
    forSlice(value, start, end, iterator, context);
  }

  function forSlice$2 (value, start, end, iterator, context) {
    if (value) {
      forSlice$1(value, start, end, iterator, context);
    }
  }

  function append$1 (arr, obj) {
    if (arr) {
      append(arr, obj);
      return obj;
    }
    return arr;
  }

  function removeAt (elems, index) {
    return elems.splice(index, 1)[0] || null;
  }

  var isArray = Array.isArray;
  function removeAt$1 (elems, index) {
    if (elems && isArray(elems)) {
      return removeAt(elems, index);
    }
    return null;
  }

  /**
   * 深度合并
   * @param {Object} srcObj
   * @param {Object} destObj
   */
  function mergeDeep(srcObj, destObj) {
    forOwn$1(destObj, function (val, key) {
      if (isObject(val)) {
        var source = srcObj[key];
        // 如果原对象对应的key值是对象，继续深度复制
        source = isObject(source) ? source : {};
        srcObj[key] = mergeDeep(source, val);
      } else {
        srcObj[key] = val;
      }
    });
    return srcObj;
  }

  /**
   * 合并对象
   * @param {Object} result
   */
  function assignDeep(result) {
    forSlice$2(arguments, 1, function (arg) {
      mergeDeep(result, arg);
    });
    return result;
  }

  /**
   * 对象转表单字符串
   * @param {Object} obj
   */
  function formify(obj) {
    var form = [];
    forOwn$1(obj, function (val, key) {
      append$1(form, (key + "=" + val));
    });
    return form.join('&');
  }

  /**
   * 拼接querystring
   * @param {String} url
   * @param {String} qs
   */
  function joinQS(url, qs) {
    return url + (url.indexOf('?') === -1 ? '?' : '&') + qs;
  }

  var util = ({
    isNil: isNil,
    isString: isString,
    isObject: isObject,
    isFunction: isFunction,
    forOwn: forOwn$1,
    assign: assign,
    forSlice: forSlice$2,
    append: append$1,
    removeAt: removeAt$1,
    stringify: stringify,
    isAbsolute: isAbsolute,
    joinURLs: joinURLs,
    mergeDeep: mergeDeep,
    assignDeep: assignDeep,
    formify: formify,
    joinQS: joinQS
  });

  var CONTENT_TYPE = 'Content-Type';
  var ECONNRESET = 'ECONNRESET';
  var ECONNABORTED = 'ECONNABORTED';
  // export const ETIMEDOUT = 'ETIMEDOUT';
  var ENETWORK = 'ENETWORK';

  /**
   * 创建异常
   * @param {String} message
   * @param {Object} options
   */
  function createError(message, options) {
    var error = new Error(message);
    assign(error, options);
    return error;
  }

  /**
   * 挂在hooks
   * @param {Promise} promise
   */
  function preloadHooks(promise) {
    forSlice$2(arguments, 1, function (hooks) {
      hooks.forEach(function (hook) {
        promise = isObject(hook) ? promise.then(hook.fulfilled, hook.rejected) : promise.then(hook);
      });
    });
    return promise;
  }

  var RCACHE = /([?&]_=)[^&]*/;
  var nonce = Date.now();
  /**
   * 禁用get请求缓存
   * @param {String} url
   */
  function disableCache(url) {
    nonce++;
    var newUrl = url.replace(RCACHE, ("$1" + nonce));
    // url上未使用缓存标识
    if (newUrl === url) {
      url = joinQS(url, '_=' + nonce);
    }
    return url;
  }

  var logErr = (console && console.error) || function () { };

  /**
   * 扩展拦截器自定义方法
   * @param {Array} arr
   */
  function interceptor(arr) {
    arr.use = function (fulfilled, rejected) {
      return append$1(arr, { fulfilled: fulfilled, rejected: rejected });
    };
    arr.eject = function (index) {
      removeAt$1(index);
      return arr;
    };
    return arr;
  }

  /**
   * 创建网络状态异常
   * @param {Number} status
   * @param {Object} options
   */
  function createStatusError(status, options) {
    options.code = status;
    return createError(("Request failed with status code " + status), options);
  }

  /**
   * 创建超时异常
   * @param {Number} timeout
   * @param {Object} options
   */
  function createTimedoutError(timeout, options) {
    options.code = ECONNRESET;
    return createError(("Timeout of " + timeout + "ms exceeded"), options);
  }

  /**
   * 创建网络请求异常
   * @param {String} message
   * @param {Object} options
   */
  function createNetworkError(message, options) {
    options.code = ENETWORK;
    return createError(message || 'Network Error', options);
  }

  /**
   * 创建主动中断请求异常
   * @param {String} message
   * @param {Object} options
   */
  function createAbortedError(message, options) {
    options.code = ECONNABORTED;
    return createError(message || 'Request aborted', options);
  }

  /**
   * 是否是主动中断请求异常
   * @param {Error} e
   */
  function isAborted(e) {
    return e && e.code === ECONNABORTED;
  }

  function request(options) {
    var url = options.url;
    var baseUrl = options.baseUrl;
    var headers = options.headers;
    var method = options.method;
    var qs = options.qs;
    var data = options.data;
    var cache = options.cache;
    var adapter = options.adapter;

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
        var ctype = headers[CONTENT_TYPE] || '';
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
  function request$1 (opts, internalHooks, interceptors) {
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

  var defaults = {
    timeout: 0,
    responseType: 'json', // 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
    validateStatus: function validateStatus(status) {
      return (status >= 200 && status < 300) || status === 304;
    }
  };

  function xhr (options) {
    return new Promise(function (resolve, reject) {
      var method = options.method;
      var url = options.url;
      var data = options.data;
      var async = options.async;
      var timeout = options.timeout;
      var responseType = options.responseType;
      var onDownloadProgress = options.onDownloadProgress;
      var onUploadProgress = options.onUploadProgress;
      var _abortion = options._abortion;

      // 异步请求对象
      var request = new window.XMLHttpRequest();

      var gc = function () {
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

        var status = request.status;
        var responseURL = request.responseURL;

        // 状态为0，或者没有内容返回
        if (status === 0 && !(responseURL && responseURL.indexOf('file:') === 0)) {
          return;
        }

        // 处理响应
        var responseData = (!responseType || responseType === 'text') ? request : (request.response || request.responseText);
        var response = {
          data: responseData,
          statusText: request.statusText,
          options: options,
          request: request,
          status: status
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
          options: options,
          request: request
        }));

        // 垃圾回收
        gc();
      };

      // 监听超时处理
      request.ontimeout = function () {
        reject(createTimedoutError(timeout, {
          options: options,
          request: request
        }));

        // 垃圾回收
        gc();
      };

      // 增加 headers
      var headers = options.headers;
      if (isFunction(request.setRequestHeader)) {
        forOwn$1(headers, function (val, key) {
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
      _abortion.push(function () {
        reject(assign(_abortion.error, {
          options: options,
          request: request
        }));
        request && request.abort();
        // 垃圾回收
        gc();
      });

    });
  }

  var CONTENT_TYPES = {
    json: 'application/json; charset=utf-8',
    form: 'application/x-www-form-urlencoded; charset=utf-8',
    'form-data': 'multipart/form-data; charset=utf-8'
  };

  var DEFAULT_POST_HEADERS = {
    'Content-Type': CONTENT_TYPES.form
  };

  var defaultHeaders = {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  };

  ['DELETE', 'GET', 'HEAD'].forEach(function (method) {
    defaultHeaders[method] = {};
  });

  ['POST', 'PUT', 'PATCH'].forEach(function (method) {
    defaultHeaders[method] = assign({}, DEFAULT_POST_HEADERS);
  });

  /**
   * 设置全局headers
   * @param {String} key
   * @param {String} value
   * @param {String|undefined} method
   */
  function setHeader(key, value, method) {
    method = method ? method.toUpperCase() : 'common';
    if (key === 'Content-Type') {
      value = CONTENT_TYPES[value] || value;
    }
    (defaultHeaders[method] || defaultHeaders.common)[key] = value;
    return this;
  }

  /**
   * 合并headers
   * @param {Object} headers
   */
  function mergeHeaders(headers, method) {
    return assign({}, defaultHeaders.common, defaultHeaders[method], headers);
  }

  /**
   * json、form、multipart 或者实际的contentType
   * @param {String} contentType
   */
  function transformContentType(contentType) {
    return contentType && CONTENT_TYPES[contentType];
  }

  var abortions = {};

  function uuid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  function buildError(anything) {
    var options = {};
    if (isObject(anything)) {
      options = anything;
      anything = '';
    }
    return createAbortedError(anything, options);
  }

  var Abortion = function Abortion() {
    this.id = uuid();
    this.state = 0;
  };

  Abortion.prototype.abort = function abort (err) {
    var ref = this;
      var state = ref.state;
    this.state = 1;
    this.error = err;
    if (!state) {
      var ref$1 = this;
        var _abort = ref$1._abort;
      if (_abort) {
        _abort();
        delete this._abort;
      }
    }
    this.remove();
  };

  Abortion.prototype.push = function push (fn) {
    if (this.state) {
      fn();
    } else {
      this._abort = fn;
    }
    return this;
  };

  Abortion.prototype.remove = function remove () {
    delete abortions[this.id];
  };

  function get(token) {
    if (token) {
      return abortions[token];
    }
    var abortion = new Abortion();
    abortions[abortion.id] = abortion;
    return abortion;
  }

  function abort(token, anything) {
    if (token) {
      var abortion = abortions[token];
      if (abortion) {
        abortion.abort(buildError(anything));
        delete abortions[token];
      }
    }
  }

  function abortAll(anything) {
    var err = buildError(anything);
    forOwn$1(abortions, function (abortion, token) {
      abortion.abort(err);
      delete abortions[token];
    });
  }

  // 默认为客户端请求
  defaults.adapter = xhr;

  var Tammy = function Tammy(options) {
    // 拦截器
    this.interceptors = {
      request: interceptor([]),
      response: interceptor([])
    };
    // 内部钩子函数, 用于扩展插件
    this.internalHooks = {
      request: interceptor([]),
      response: interceptor([])
    };
    // 合并参数
    this.defaults = assignDeep({}, defaults, options);
  };

  /**
   * http请求
   * @param {Object} opts
   */
  Tammy.prototype.request = function request$1$1 (opts) {
    // 合并全局参数
    opts = assign({}, this.defaults, opts);

    var method = opts.method;
      var headers = opts.headers;
      var contentType = opts.contentType;
      var abortion = opts.abortion;
    method = opts.method = method ? method.toUpperCase() : 'GET';

    // 合并headers
    headers = opts.headers = mergeHeaders(headers, method);
    var ctype;
    if ((ctype = transformContentType(contentType))) {
      headers[CONTENT_TYPE] = ctype;
    }

    var _abortion = opts._abortion = get();
    if (isFunction(abortion)) {
      abortion(_abortion.id);
    }

    return request$1(opts, this.internalHooks, this.interceptors);
  };

  /**
   * 设置全局headers
   * @param {String} key
   * @param {String} value
   * @param {String|undefined} method
   */
  Tammy.prototype.setHeader = setHeader;

  var mergeDeep$1 = mergeDeep;
  var isObject$1 = isObject;
  var assign$1 = assign;

  function createInstance(options) {
    var tammy = new Tammy(options);

    /**
     * http请求服务
     * @param {String|Object} url
     * @param {Object|undefined} opts
     */
    var $http = function (url, opts) {
      if (isObject$1(url)) {
        opts = url;
        url = opts.url;
      } else {
        opts = opts || {};
        opts.url = url;
      }
      return tammy.request(opts);
    };

    assign$1($http, {
      /**
       * 挂载全局钩子
       * @param {Function} fn
       */
      use: function use(fn) {
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
      create: function create(options) {
        return createInstance(options);
      },

      /**
       * 合并提交
       * @param  {Array} opts
       */
      all: function all(opts) {
        return Promise.all(opts.map(function (opt) { return $http(opt); }));
      },

      /**
       * 是否是中断异常
       */
      isAborted: isAborted,

      /**
       * 中断请求
       * @param {String} token
       * @param {String} anything
       */
      abort: function abort$1(token, anything) {
        abort(token, anything);
        return $http;
      },

      /**
       * 中断所有的请求
       * @param {String} anything
       */
      abortAll: function abortAll$1(anything) {
        abortAll(anything);
        return $http;
      },

      /**
       * 常用方法
       */
      util: util
    });

    ['get', 'delete', 'head', 'options', 'post', 'put', 'patch'].forEach(function (method) {
      $http[method] = function (url, data, options) {
        return $http(url, mergeDeep$1({ method: method, data: data }, options));
      };
    });

    $http.del = $http['delete'];

    return $http;
  }

  var instance = createInstance();

  function auth (ref) {
    var internalHooks = ref.internalHooks;

    if (window && window.window === window) {
      internalHooks.request.use(function (options) {
        // HTTP basic authentication
        var auth = options.auth;
        var headers = options.headers;
        if (auth) {
          var username = auth.username || '';
          var password = auth.password || '';
          headers.Authorization = 'Basic ' + window.btoa(username + ':' + password);
        }
        return options;
      });
    }
  }

  function isNumber (value) {
    return typeof value === 'number';
  }

  function isStandardBrowserEnv() {
    if (!isNil(navigator) && (navigator.product === 'ReactNative' ||
      navigator.product === 'NativeScript' ||
      navigator.product === 'NS')) {
      return false;
    }
    return (!isNil(window) && !isNil(document));
  }

  var isURLSameOrigin = isStandardBrowserEnv() ?

    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      function resolveURL(url) {
        var href = url;

        if (msie) {
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      return function isURLSameOrigin(requestURL) {
        var parsed = (isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
          parsed.host === originURL.host);
      };
    })() :

    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })();

  var cookies = {
    set: function set() { },
    get: function get() { return null; },
    remove: function remove() { }
  };

  if (isStandardBrowserEnv) {
    cookies.set = function set(name, value, expires, path, domain, secure) {
      var cookie = [];
      cookie.push(name + '=' + encodeURIComponent(value));

      if (isNumber(expires)) {
        cookie.push('expires=' + new Date(expires).toGMTString());
      }

      if (isString(path)) {
        cookie.push('path=' + path);
      }

      if (isString(domain)) {
        cookie.push('domain=' + domain);
      }

      if (secure === true) {
        cookie.push('secure');
      }

      document.cookie = cookie.join('; ');
    };

    cookies.get = function get(name) {
      var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
      return (match ? decodeURIComponent(match[3]) : null);
    };

    cookies.remove = function remove(name) {
      this.write(name, '', Date.now() - 86400000);
    };
  }

  function xsrf (ref) {
    var internalHooks = ref.internalHooks;

    if (window && window.window === window) {
      internalHooks.request.use(function (options) {
        var url = options.url;
        var headers = options.headers;
        var withCredentials = options.withCredentials;
        var xsrfCookieName = options.xsrfCookieName; if ( xsrfCookieName === void 0 ) xsrfCookieName = 'XSRF-TOKEN';
        var xsrfHeaderName = options.xsrfHeaderName; if ( xsrfHeaderName === void 0 ) xsrfHeaderName = 'X-XSRF-TOKEN';

        // 判断是浏览器环境
        if (isStandardBrowserEnv()) {
          // 增加 xsrf header
          var xsrfValue = (withCredentials || isURLSameOrigin(url)) && xsrfCookieName ?
            cookies.get(xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            headers[xsrfHeaderName] = xsrfValue;
          }
        }

        return options;
      });
    }
  }

  var rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg;
  function parseRawHeaders(rawHeaders) {
    var responseHeaders = {};
    var match;
    while ((match = rheaders.exec(rawHeaders))) {
      responseHeaders[match[1].toLowerCase()] = match[2];
    }
    return responseHeaders;
  }

  function resHeaders (ref) {
    var internalHooks = ref.internalHooks;

    if (window && window.XMLHttpRequest) {
      internalHooks.response.use(function (response) {
        var request = response.request;
        var options = response.options;
        var getAllResponseHeaders = options.getAllResponseHeaders;
        if (getAllResponseHeaders && request.getAllResponseHeaders) {
          response.headers = parseRawHeaders(request.getAllResponseHeaders());
        }
        return response;
      });
    }
  }

  instance
    .use(auth)
    .use(xsrf)
    .use(resHeaders);

  instance.plugins = { auth: auth, xsrf: xsrf, resHeaders: resHeaders };

  return instance;

}));
