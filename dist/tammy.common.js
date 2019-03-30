/*!
 * tammy.js v1.0.0-beta.6
 * (c) 2018-2019 Jesse Feng
 * Released under the MIT License.
 */
'use strict';

function isNil (value) {
  /* eslint eqeqeq: 0 */
  return value == null;
}

function isObject (value) {
  return !isNil(value) && typeof value === 'object';
}

function iteratorCallback (iterator, context) {
  return context ? iterator.bind(context) : iterator;
}

function forOwn (value, iterator, context) {
  var cb = iteratorCallback(iterator, context);
  for (var key in value) {
    if (value.hasOwnProperty(key) && cb(value[key], key, value) === false) {
      break;
    }  }
}

function forOwn$1 (value, iterator, context) {
  return isObject(value) && forOwn(value, iterator, context);
}

function append (arr, obj) {
  arr[arr.length] = obj;
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
  return /^([a-z][a-z0-9+\-.]*:)?\/\//i.test(url);
}

function forSlice (value, start, end, iterator, context) {
  var cb = iteratorCallback(iterator, context);
  for (var i = start, returnValue = (void 0); returnValue !== false && i < end; i++) {
    returnValue = cb(value[i], i, value);
  }
}

function joinURLs (baseURL) {
  var args = arguments;
  var len = args.length;
  if (!isNil(baseURL)) {
    baseURL = baseURL.replace(/\/+$/, '');
  } else if (len > 1) {
    baseURL = '';
  }
  var str = '';
  forSlice(args, 1, len, function (arg) {
    str += '/';
    str += arg || '';
  });
  if (str) {
    baseURL += str.replace(/\/+/g, '/');
  }
  return baseURL;
}

function forIn (value, iterator, context) {
  var cb = iteratorCallback(iterator, context);
  for (var key in value) {
    if (cb(value[key], key, value) === false) {
      break;
    }  }
}

function forIn$1 (value, iterator, context) {
  return isObject(value) && forIn(value, iterator, context);
}

function forEach (value, iterator, context) {
  forSlice(value, 0, value.length, iterator, context);
}

function forEach$1 (value, iterator, context) {
  return value && forEach(value, iterator, context);
}

function isFunction (value) {
  return typeof value === 'function';
}

function forSlice$1 (value, start, end, iterator, context) {
  if (value) {
    if (isFunction(end)) {
      context = iterator;
      iterator = end;
      end = value.length;
    }
    forSlice(value, start, end || value.length, iterator, context);
  }
}

function append$1 (arr, obj) {
  if (arr) {
    append(arr, obj);
    return obj;
  }
}

function removeAt (elems, index) {
  elems.splice(index, 1);
  return index;
}

var CONTENT_TYPE = 'Content-Type';
var ECONNRESET = 'ECONNRESET';
var ETIMEOUT = 'ETIMEOUT';
var ENETWORK = 'ENETWORK';

/**
 * 派生对象
 * @param {Object} target
 * @param {...Object}
 */
var assign = Object.assign || function (target) {
  if (isNil(target)) {
    throw new TypeError('Cannot convert undefined or null to object');
  }
  var to = Object(target);
  var args = arguments;
  forEach$1(args, function (nextSource) {
    forIn$1(nextSource, function (nextValue, nextKey) {
      to[nextKey] = nextValue;
    });
  });
  return to;
};

/**
 * 深度合并
 * @param {Object} srcObj
 * @param {Object} destObj
 */
function deepMerge(srcObj, destObj) {
  forIn$1(destObj, function (val, key) {
    if (isObject(val)) {
      var source = srcObj[key];
      // 如果原对象对应的key值是对象，继续深度复制
      source = isObject(source) ? source : {};
      srcObj[key] = deepMerge(source, val);
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
function deepAssign(result) {
  var args = arguments;
  forSlice$1(args, 1, function (arg) {
    deepMerge(result, arg);
  });
  return result;
}

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
 * 对象转表单字符串
 * @param {Object} obj
 */
function toFormString(obj) {
  var form = [];
  forIn$1(obj, function (val, key) {
    append$1(form, (key + "=" + val));
  });
  return form.join('&');
}

/**
 * 挂在hooks
 * @param {Promise} promise
 */
function preloadHooks(promise) {
  var args = arguments;
  forSlice$1(args, 1, function (hooks) {
    hooks.forEach(function (hook) {
      promise = isObject(hook) ? promise.then(hook.fulfilled, hook.rejected) : promise.then(hook);
    });
  });
  return promise;
}

/**
 * 拼接querystring
 * @param {String} url
 * @param {String} qs
 */
function joinQS(url, qs) {
  return url + (url.indexOf('?') === -1 ? '?' : '&') + qs;
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
    append$1(arr, { fulfilled: fulfilled, rejected: rejected });
    return arr;
  };
  arr.eject = function (index) {
    removeAt(index);
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
function createTimeoutError(timeout, options) {
  options.code = ETIMEOUT;
  return createError(("Timeout of " + timeout + "ms exceeded"), options);
}

/**
 * 创建网络请求异常
 * @param {String} message
 * @param {Object} options
 */
function createNetworkError(message, options) {
  options.code = ENETWORK;
  return createError(message || 'Network Error');
}

var CONTENT_TYPE$1 = 'Content-Type';

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
      var ctype = headers[CONTENT_TYPE$1] || '';
      if (isObject(data)) {
        if (!ctype.indexOf('application/json')) {
          data = JSON.stringify(data);
        } else {
          data = toFormString(data);
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

function isString (value) {
  return typeof value === 'string';
}

var MESSAGE = 'Request aborted';
var managers = {};

function uuid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function buildError(anything) {
  var options = {};
  if (!anything) {
    anything = MESSAGE;
  } else if (isObject(anything)) {
    options = anything;
    anything = anything.message || MESSAGE;
  }
  options.code = ECONNRESET;
  return createError(anything, options);
}

function abort(token, anything, ctx) {
  var fn = managers[token];
  fn(buildError(anything));
  delete managers[token];
  return ctx;
}

function abortAll(anything, ctx) {
  forIn$1(managers, function (fn, token) {
    fn(buildError(anything));
    delete managers[token];
  });
  return ctx;
}

function push(fn) {
  var token = uuid();
  managers[token] = fn;
  return token;
}

function isAborted(e) {
  return e && e.code === ECONNRESET;
}

function clearAbortions(abortedToken) {
  if (abortedToken) {
    delete managers[abortedToken];
  }
}

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
    var abortion = options.abortion;

    var abortedError;
    var abortedToken;

    // 异步请求对象
    var request = new window.XMLHttpRequest();

    var gc = function () {
      abortedError = null;
      abortedToken = null;
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

      clearAbortions(abortedToken);

      var status = request.status;
      var responseURL = request.responseURL;
      var responseText = request.responseText;

      // 状态为0，或者没有内容返回
      if (status === 0 && !(responseURL && responseURL.indexOf('file:') === 0)) {
        return;
      }

      // 处理响应
      var responseData = (!responseType || responseType === 'text') ? request : (request.response || responseText);
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
    request.onabort = function () {
      if (!request) {
        return;
      }
      reject(assign(abortedError, {
        options: options,
        request: request
      }));

      // 垃圾回收
      clearAbortions(abortedToken);
      gc();
    };

    // 主动中断请求
    abortedToken = push(function (error) {
      abortedError = error;
      request && request.abort();
    });
    if (isFunction(abortion)) {
      abortion(abortedToken);
    }

    // 监听网络错误
    request.onerror = function () {
      clearAbortions(abortedToken);
      reject(createNetworkError(null, {
        options: options,
        request: request
      }));

      // 垃圾回收
      gc();
    };

    // 监听超时处理
    request.ontimeout = function () {
      clearAbortions(abortedToken);
      reject(createTimeoutError(timeout, {
        options: options,
        request: request
      }));

      // 垃圾回收
      gc();
    };

    // 增加 headers
    var headers = options.headers;
    if (isFunction(request.setRequestHeader)) {
      forIn$1(headers, function (val, key) {
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

  });
}

var CONTENT_TYPES = {
  json: 'application/json; charset=UTF-8',
  form: 'application/x-www-form-urlencoded; charset=UTF-8',
  'form-data': 'multipart/form-data; charset=UTF-8'
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
  this.defaults = deepAssign({}, defaults, options);
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
  method = opts.method = method ? method.toUpperCase() : 'GET';

  // 合并headers
  headers = opts.headers = mergeHeaders(headers, method);
  var ctype;
  if ((ctype = transformContentType(contentType))) {
    headers[CONTENT_TYPE] = ctype;
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

function createInstance(options) {
  var tammy = new Tammy(options);

  /**
   * http请求服务
   * @param {String|Object} url
   * @param {Object|undefined} opts
   */
  var $http = function (url, opts) {
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
      return abort(token, anything, $http);
    },

    /**
     * 中断所有的请求
     * @param {String} anything
     */
    abortAll: function abortAll$1(anything) {
      return abortAll(anything, $http);
    }
  });

  ['get', 'delete', 'head', 'options', 'post', 'put', 'patch'].forEach(function (method) {
    $http[method] = function (url, data, options) {
      return $http(url, deepMerge({ method: method, data: data }, options));
    };
  });

  $http.del = $http['delete'];

  return $http;
}

var instance = createInstance();

module.exports = instance;
