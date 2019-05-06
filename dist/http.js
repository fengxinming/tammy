/*!
 * tammy.js v1.0.0
 * (c) 2018-2019 Jesse Feng
 * Released under the MIT License.
 */
'use strict';

function append (arr, obj) {
  arr[arr.length] = obj;
  return arr;
}

function append$1 (arr, obj) {
  if (arr) {
    append(arr, obj);
    return obj;
  }
  return arr;
}

function isNil (value) {
  /* eslint eqeqeq: 0 */
  return value == null;
}

function isObject (value) {
  return !isNil(value) && typeof value === 'object';
}

function isAbsolute (url) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}

function isString (value) {
  return typeof value === 'string';
}

var ref = require('url');
var URL = ref.URL;
var http = require('http');
var https = require('https');
var zlib = require('zlib');
var EventEmitter = require('events');
var clrsole = require('clrsole');

var RHTTPS = /https:?/;
var logger = clrsole.getLogger('Tammy');

/**
 * 解码buffer
 * @param {http.ServerResponse} res
 * @param {Buffer} body
 * @param {Function} cb
 */
function decodeResponseBody(res, body, cb) {
  if (body.length) {
    var contentEncoding = res.headers['content-encoding'];
    if (contentEncoding) {
      contentEncoding = contentEncoding.toLowerCase();
      // 解压
      switch (contentEncoding) {
        case 'gzip':
        case 'deflate':
          zlib.unzip(body, function (err, data) {
            if (err && err.name === 'Error') {
              err.name = 'UnzipError';
            }
            cb(err, data, contentEncoding);
          });
          break;
        default:
          cb(null, body, contentEncoding);
      }
    } else {
      cb(null, body);
    }
  } else {
    cb(null, body);
  }
}

/**
 * 解析buffer
 * @param {Buffer} buf
 * @param {String} encoding
 */
function parseJSON(buf, encoding) {
  var json = buf.toString(encoding);
  try {
    json = JSON.parse(json);
  } catch (e) {
    logger.warn('Parse body error', e);
    json = buf;
  }
  return json;
}

var Request = /*@__PURE__*/(function (EventEmitter) {
  function Request () {
    EventEmitter.apply(this, arguments);
  }

  if ( EventEmitter ) Request.__proto__ = EventEmitter;
  Request.prototype = Object.create( EventEmitter && EventEmitter.prototype );
  Request.prototype.constructor = Request;

  Request.prototype.request = function request (options) {
    var this$1 = this;


    var protocol = options.protocol;
    var host = options.host;
    var family = options.family;
    var port = options.port;
    var localAddress = options.localAddress;
    var socketPath = options.socketPath;
    var method = options.method;
    var path = options.path;
    var headers = options.headers;
    var auth = options.auth;
    var agent = options.agent;
    var createConnection = options.createConnection;
    var timeout = options.timeout;
    var setHost = options.setHost;
    var url = options.url;
    var responseEncoding = options.responseEncoding;
    var responseType = options.responseType;
    var data = options.data;

    var error = null;
    var parsed;

    // 网络协议
    protocol = protocol || 'http:';
    url = url || path;
    if (!isString(url)) {
      error = new TypeError(("Invalid URL: " + url));
      error.code = 'ERR_INVALID_URL';
      throw error;
    }

    // HTTP basic authentication
    if (isObject(auth)) {
      var username = auth.username || '';
      var password = auth.password || '';
      auth = username + ':' + password;
    }

    // 如果是正常的url地址
    if (isAbsolute(url)) {
      // Parse url
      parsed = new URL(url);

      url = parsed.pathname + parsed.search;

      // 重新设置网络协议
      protocol = parsed.protocol;

      if (!auth) {
        auth = parsed.auth;
      }

      host = parsed.hostname;
      port = parsed.port;
    }

    var isHttpsRequest = RHTTPS.test(protocol);
    var defaultHttp = http;
    var defaultPort = 80;
    if (isHttpsRequest) {
      defaultHttp = https;
      defaultPort = 443;
    }

    var httpOptions = {
      protocol: protocol,
      method: method,
      headers: headers,
      agent: agent,
      path: url
    };

    if (auth) {
      delete headers.Authorization;
      httpOptions.auth = auth;
    }

    if (socketPath) {
      httpOptions.socketPath = socketPath;
    } else {
      httpOptions.host = host;
      httpOptions.port = port || defaultPort;
    }

    if (family) {
      httpOptions.family = family;
    }

    if (localAddress) {
      httpOptions.localAddress = localAddress;
    }

    if (timeout) {
      httpOptions.timeout = timeout;
    }

    if (createConnection) {
      httpOptions.createConnection = createConnection;
    }

    if (setHost === false) {
      httpOptions.setHost = setHost;
    }

    // 请求之前触发
    this.emit('beforeRequest', httpOptions, options);

    var chunks = []; // buffer数组
    var contentLength = 0; // 接收到的内容长度
    var iRes = null; // 内部response对象
    var isAborted = false;

    var req = defaultHttp.request(httpOptions, function (res) {
      iRes = res;

      // 刚发起request请求
      this$1.emit('response', req, res, httpOptions, options);

      // 响应之后才触发 req.abort()
      res.on('aborted', function () {
        isAborted = true;
        this$1.emit('abort', null, req, res, httpOptions, options);
      });

      // 接收数据
      res.on('data', function (chunk) {
        contentLength += chunk.length;
        append$1(chunks, chunk);
      });

      // 数据接收完成
      res.on('end', function () {
        // 中途出现异常或者被中断请求，就不继续往下执行
        if (error || isAborted) {
          error = null;
          isAborted = false;
          return;
        }

        // buffer
        var body = Buffer.concat(chunks, contentLength);

        this$1.emit('received', body, req, res, httpOptions, options);

        decodeResponseBody(res, body, function (err, buf) {
          if (err) {
            // unzip 异常
            this$1.emit('error', err, req, res, httpOptions, options);
          }

          switch (responseType) {
            case 'json':
              body = parseJSON(buf, responseEncoding);
              break;
            case 'text':
              body = buf.toString(responseEncoding);
              break;
            case 'arraybuffer':
              body = buf;
              break;
            default:
              var contentType = res.headers['content-type'];
              if (contentType.startsWith('application/json')) {
                body = parseJSON(buf, responseEncoding);
              } else if (contentType.startsWith('text')) {
                body = buf.toString(responseEncoding);
              } else {
                body = buf;
              }
          }

          this$1.emit('end', body, req, res, httpOptions, options);
        });
      });
    });

    // 请求了之后触发
    this.emit('request', req, iRes, httpOptions, options);

    // req.abort() 触发
    req.on('abort', function () {
      isAborted = true;
    });

    // 监听异常
    req.on('error', function (e) {
      error = e;
      this$1.emit(isAborted && e.code === 'ECONNRESET' ? 'abort' : 'error', e, req, iRes, httpOptions);
    });

    // 关闭连接
    req.on('close', function () {
      this$1.emit('close', req, iRes, httpOptions);
    });

    // 处理post请求
    if (data) {
      req.write(data);
    }

    // end后才会发起请求
    req.end();

    return this;
  };

  return Request;
}(EventEmitter));

var ECONNABORTED = 'ECONNABORTED';

function http$1 (options) {
  return new Promise(function (resolve, reject) {
    var _abortion = options._abortion;

    var request = new Request();
    request
      .on('beforeRequest', function () {
        if (_abortion.state) {
          reject(Object.assign(_abortion.error, {
            options: options
          }));
          _abortion.remove();
        }
      })
      .on('request', function (req) {
        // 添加中断请求函数
        _abortion.push(function () { return req.abort(); });
      })
      .on('error', function (err, req) {
        reject(Object.assign(err, {
          options: options,
          request: req
        }));
        _abortion.remove();
      })
      .on('abort', function (err, req) {
        reject(Object.assign(_abortion.error || err, {
          options: options,
          request: req,
          code: ECONNABORTED
        }));
        _abortion.remove();
      })
      .on('end', function (body, req, res) {
        var response = {
          data: body,
          statusText: res.statusMessage,
          options: options,
          request: req,
          status: res.statusCode,
          headers: res.headers
        };
        _abortion.state ? reject(Object.assign(_abortion.error, response)) : resolve(response);
        _abortion.remove();
      })
      .request(options);

  });
}

var toString = Object.prototype.toString;

function isStandardNodeEnv() {
  return process && toString.call(process) === '[object process]';
}

function plugin(ref, $http) {
  var defaults = ref.defaults;

  if (isStandardNodeEnv()) {
    // For node use HTTP adapter
    defaults.adapter = http$1;
  }
}

plugin.Request = Request;

module.exports = plugin;
