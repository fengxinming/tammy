/*!
 * tammy.js v1.0.0
 * (c) 2018-2019 Jesse Feng
 * Released under the MIT License.
 */
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

function append$1 (arr, obj) {
  if (arr) {
    append(arr, obj);
    return obj;
  }
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

var rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg;

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
 * 合并对象
 * @param {Object} result
 * @param  {...Object} args
 */
function merge(result) {
  var args = [], len = arguments.length - 1;
  while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  function cb(val, key) {
    if (isObject(val)) {
      var source = result[key];
      source = isObject(source) ? source : {};
      result[key] = merge(source, val);
    } else {
      result[key] = val;
    }
  }
  forEach$1(args, function (arg) {
    forIn$1(arg, cb);
  });
  return result;
}

function parseRawHeaders(rawHeaders) {
  var responseHeaders = {};
  var match;
  while ((match = rheaders.exec(rawHeaders))) {
    responseHeaders[match[1].toLowerCase()] = match[2];
  }
  return responseHeaders;
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
 * @param {Array} hooks
 */
function preloadHooks(promise, hooks) {
  hooks.forEach(function (ref) {
    var fulfilled = ref.fulfilled;
    var rejected = ref.rejected;

    promise = promise.then(fulfilled, rejected);
  });
  return promise;
}

var logErr = (console && console.error) || function () { };

var CONTENT_TYPES = {
  json: 'application/json; charset=UTF-8',
  form: 'application/x-www-form-urlencoded; charset=UTF-8',
  multipart: 'multipart/form-data; charset=UTF-8'
};

var DEFAULT_POST_HEADERS = {
  'Content-Type': CONTENT_TYPES.form
};

var defaults = {
  timeout: 0,
  responseType: 'json', // 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  maxContentLength: -1,
  validateStatus: function validateStatus(status) {
    return (status >= 200 && status < 300) || status === 304;
  }
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

var context = {
  /**
   * 设置全局默认配置
   */
  defaults: defaults,

  /**
   * 处理headers的钩子函数
   */
  xhrHeaderHooks: [],

  /**
   * 请求钩子
   */
  reqHooks: [],

  /**
   * 响应钩子
   */
  resHooks: [],

  /**
   * 设置全局headers
   * @param {String} key
   * @param {String} value
   * @param {String|undefined} method
   */
  setHeader: function setHeader(key, value, method) {
    method = method ? method.toUpperCase() : 'common';
    if (key === 'Content-Type') {
      value = CONTENT_TYPES[value] || value;
    }
    (defaultHeaders[method] || defaultHeaders.common)[key] = value;
    return this;
  }
};

function isFunction (value) {
  return typeof value === 'function';
}

var xhrHeaderHooks = context.xhrHeaderHooks;

function xhr (options) {
  return new Promise(function (resolve, reject) {
    var method = options.method;
    var url = options.url;
    var data = options.data;
    var async = options.async;
    var headers = options.headers;
    var timeout = options.timeout;
    var responseType = options.responseType;
    var onDownloadProgress = options.onDownloadProgress;
    var onUploadProgress = options.onUploadProgress;
    var abortion = options.abortion;
    var getAllResponseHeaders = options.getAllResponseHeaders;

    var request = new window.XMLHttpRequest();

    // 发送异步请求
    request.open(method, url, async !== false);

    // 设置超时毫秒数
    request.timeout = timeout || 0;

    // 监听异步返回状态
    request.onreadystatechange = function onreadystatechange() {
      if (!request || request.readyState !== 4) {
        return;
      }

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

      if (getAllResponseHeaders && 'getAllResponseHeaders' in request) {
        response.headers = parseRawHeaders(request.getAllResponseHeaders());
      }

      if (options.validateStatus(status)) {
        resolve(response);
      } else {
        reject(createError(("Request failed with status code " + status), response));
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
        options: options,
        request: request
      }, request.customError)));

      // 垃圾回收
      request = null;
    };

    // 监听网络错误
    request.onerror = function onerror() {
      reject(createError('Network Error', {
        options: options,
        request: request
      }));

      // 垃圾回收
      request = null;
    };

    // 监听超时处理
    request.ontimeout = function ontimeout() {
      reject(createError(("timeout of " + timeout + "ms exceeded"), {
        code: 'ECONNABORTED',
        options: options,
        request: request
      }));

      // 垃圾回收
      request = null;
    };

    xhrHeaderHooks.forEach(function (cb) { return cb(options); });

    // 增加 headers
    if ('setRequestHeader' in request) {
      forIn$1(headers, function (val, key) {
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
      abortion.add(function (error) {
        request.customError = error;
        request.abort();
      });
    }

    // 发送数据到服务端
    request.send(data || null);

  });
}

var reqHooks = context.reqHooks;
var resHooks = context.resHooks;

// 默认为客户端请求
defaults.adapter = xhr;

function request(options) {
  var url = options.url;
  var baseURL = options.baseURL;
  var headers = options.headers;
  var method = options.method;
  var contentType = options.contentType;
  var params = options.params;
  var data = options.data;
  var adapter = options.adapter;

  if (baseURL && !isAbsolute(url)) {
    url = options.url = joinURLs(baseURL, url);
  }

  method = options.method = method ? method.toUpperCase() : 'GET';

  // 合并headers
  headers = options.headers = merge({}, defaultHeaders.common, defaultHeaders[method], headers);
  var ctype;
  if ((ctype = contentType && CONTENT_TYPES[contentType])) {
    headers['Content-Type'] = ctype;
  }

  switch (method) {
    // case 'HEAD':
    case 'GET':
      if (!params) {
        // 避免在发送get请求时，把data属性当作params
        options.params = params = data;
        options.data = data = undefined;
      }
      break;
    case 'POST':
      // 校验post数据格式
      ctype = headers['Content-Type'] || '';
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

  if (isObject(params)) {
    params = stringify(params);
  }
  if (isString(params)) {
    options.url = url + (url.indexOf('?') > -1 ? '?' : '&') + params;
  }

  return adapter(options).then(function (response) {
    var options = response.options;
    var data = response.data;
    if (options.responseType === 'json' && isString(data)) {
      try {
        response.data = JSON.parse(data);
      } catch (e) {
        logErr('parse data error: ', e);
      }
    }
    return response;
  });
}

var Tammy = function Tammy(options) {
  // 请求钩子
  this.reqHooks = [];
  // 响应钩子
  this.resHooks = [];
  // 合并参数
  this.options = options;
};

/**
 * 添加拦截器
 * @param {String} hookName 拦截器名称
 * @param {Function} fulfilled 成功回调
 * @param {Function} rejected 异常回调
 */
Tammy.prototype.hook = function hook (hookName, fulfilled, rejected) {
  append$1(this[hookName], { fulfilled: fulfilled, rejected: rejected });
  return this;
};

/**
 * http请求
 * @param {String|Object} url
 * @param {Object|undefined} options
 */
Tammy.prototype.request = function request$1 (opts) {
  // 合并全局参数
  opts = assign(merge({}, defaults), this.options, opts);

  var promise = Promise.resolve(opts);
  // 优先挂在全局钩子
  promise = preloadHooks(
    preloadHooks(
      preloadHooks(
        preloadHooks(promise, reqHooks),
        this.reqHooks
      ).then(request),
      resHooks
    ),
    this.resHooks
  );
  return promise;
};

var Abortion = function Abortion() {
  this.queue = [];
};

Abortion.prototype.abort = function abort (anything) {
  var options;
  if (!anything) {
    anything = 'Request aborted';
  } else if (isObject(anything)) {
    options = anything;
    anything = anything.message || '';
  }
  var ref = this;
    var queue = ref.queue;
  var fn;
  while ((fn = queue.shift())) {
    fn(createError(anything, options));
  }
};

Abortion.prototype.add = function add (fn) {
  append$1(this.queue, fn);
  return this;
};

Abortion.prototype.clear = function clear () {
  this.queue.length = 0;
  return this;
};

Abortion.prototype.pipe = function pipe (abortion) {
  var queue;
  if (abortion && (queue = abortion.queue)) {
    var fn;
    while ((fn = queue.shift())) {
      append$1(queue, fn);
    }
  }
  return this;
};

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
     * 中断请求
     */
    Abortion: Abortion,

    /**
     * 挂载全局钩子
     * @param {Function} fn
     */
    use: function use(fn) {
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
    hookRequest: function hookRequest(fulfilled, rejected) {
      tammy.hook('reqHooks', fulfilled, rejected);
      return $http;
    },

    /**
     * 拦截响应
     * @param {Function} fulfilled
     * @param {Function} rejected
     */
    hookResponse: function hookResponse(fulfilled, rejected) {
      tammy.hook('resHooks', fulfilled, rejected);
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
     * 合并提交
     * @param  {...Object} opts
     */
    map: function map() {
      var opts = [], len = arguments.length;
      while ( len-- ) opts[ len ] = arguments[ len ];

      return $http.all(opts);
    }
  });

  ['get', 'delete', 'head', 'options', 'post', 'put', 'patch'].forEach(function (method) {
    $http[method] = function (url, data, options) {
      return $http(url, merge({ method: method, data: data }, options));
    };
  });

  return $http;
}

var instance = createInstance();

export default instance;
