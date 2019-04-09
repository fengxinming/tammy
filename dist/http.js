/*!
 * tammy.js v1.0.0-beta.7
 * (c) 2018-2019 Jesse Feng
 * Released under the MIT License.
 */
'use strict';

function isFunction (value) {
  return typeof value === 'function';
}

function isNil (value) {
  /* eslint eqeqeq: 0 */
  return value == null;
}

function iteratorCallback (iterator, context) {
  return context ? iterator.bind(context) : iterator;
}

function forSlice (value, start, end, iterator, context) {
  var cb = iteratorCallback(iterator, context);
  for (var i = start, returnValue = (void 0); returnValue !== false && i < end; i++) {
    returnValue = cb(value[i], i, value);
  }
}

function forOwn (value, iterator, context) {
  var cb = iteratorCallback(iterator, context);
  for (var key in value) {
    if (value.hasOwnProperty(key) && cb(value[key], key, value) === false) {
      break;
    }  }
}

function isObject (value) {
  return !isNil(value) && typeof value === 'object';
}

function forOwn$1 (value, iterator, context) {
  return isObject(value) && forOwn(value, iterator, context);
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

function isUndefined (value) {
  return typeof value === 'undefined';
}

function defineProto(proto, isDOM) {
  return function (name, options) {
    if (name in proto) {
      name = 'c$' + name;
    }
    if (isDOM) {
      if (!isUndefined(options.value) && isUndefined(options.writable)) {
        options.writable = true;
      }
      Object.defineProperty(proto, name, assign({
        enumerable: false,
        configurable: true
      }, options));
    } else {
      proto[name] = options;
    }
  };
}

var arrayProto = Array.prototype;

var defineArrayProto = defineProto(arrayProto);

function append (arr, obj) {
  arr[arr.length] = obj;
  return arr;
}

defineArrayProto('append', function (value) {
  return append(this, value);
});

var logErr = (console && console.error) || function () { };

function uuid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function push(fn) {
  var token = uuid();
  return token;
}

var ref = require('url');
var URL = ref.URL;
var http = require('http');
var https = require('https');
var zlib = require('zlib');
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
            cb(err, data);
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

function http$1 (options) {
  return new Promise(function (resolve, reject) {
    var url = options.url;
    var method = options.method;
    var data = options.data;
    var headers = options.headers;
    var auth = options.auth;
    var abortion = options.abortion;
    var socketPath = options.socketPath;
    var httpAgent = options.httpAgent;
    var httpsAgent = options.httpsAgent;
    var responseEncoding = options.responseEncoding;
    var responseType = options.responseType;
    var timeout = options.timeout;

    // Parse url
    var parsed = new URL(url);
    var protocol = parsed.protocol || 'http:';
    var isHttpsRequest = RHTTPS.test(protocol);
    var agent = isHttpsRequest ? (httpsAgent || new https.Agent()) : httpAgent;

    var httpOptions = {
      path: parsed.pathname + parsed.search,
      method: method,
      headers: headers,
      agent: agent
    };

    // HTTP basic authentication
    if (auth) {
      var username = auth.username || '';
      var password = auth.password || '';
      auth = username + ':' + password;
    }
    if (!auth && parsed.auth) {
      var urlAuth = parsed.auth.split(':');
      var urlUsername = urlAuth[0] || '';
      var urlPassword = urlAuth[1] || '';
      auth = urlUsername + ':' + urlPassword;
    }
    if (auth) {
      delete headers.Authorization;
      httpOptions.auth = auth;
    }

    if (socketPath) {
      httpOptions.socketPath = socketPath;
    } else {
      httpOptions.host = parsed.hostname;
      httpOptions.port = parsed.port || 80;
    }

    if (timeout) {
      httpOptions.timeout = timeout;
    }

    var chunks = [];
    var contentLength = 0;
    var error;
    var abortedToken;

    var req = http.request(httpOptions, function (res) {
      // 主动中断请求
      abortedToken = push(function (e) {
        error = e;
        req.abort();
      });
      if (isFunction(abortion)) {
        abortion(abortedToken);
      }

      res.on('data', function (chunk) {
        contentLength += chunk.length;
        chunks.append(chunk);
      });
      res.on('end', function () {
        // buffer
        var body = Buffer.concat(chunks, contentLength);

        if (error) {
          reject(assign(error, {
            options: options,
            request: req
          }));
          error = null;
          return;
        }

        var response = {
          statusText: res.statusMessage,
          options: options,
          request: req,
          status: res.statusCode,
          headers: res.headers
        };

        decodeResponseBody(res, body, function (err, buf) {
          if (err) {
            reject(assign(err, response));
          } else {
            switch (responseType) {
              case 'json':
                response.data = parseJSON(buf, responseEncoding);
                break;
              case 'text':
                response.data = buf.toString(responseEncoding);
                break;
              case 'arraybuffer':
                response.data = buf;
                break;
              default:
                var contentType = res.headers['content-type'];
                if (contentType.startsWith('application/json')) {
                  response.data = parseJSON(buf, responseEncoding);
                } else if (contentType.startsWith('text')) {
                  response.data = buf.toString(responseEncoding);
                } else {
                  response.data = buf;
                }
            }
            resolve(response);
          }
        });
      });
    });

    req.on('error', function (e) {
      error = e;
      reject(assign(error, {
        options: options,
        request: req
      }));
      error = null;
    });

    // 处理post请求
    if (data) {
      req.write(data);
    }
    req.end();

  });
}

var toString = Object.prototype.toString;

function isStandardNodeEnv() {
  return process && toString.call(process) === '[object process]';
}

function plugin(ref) {
  var defaults = ref.defaults;

  if (isStandardNodeEnv()) {
    // For node use HTTP adapter
    defaults.adapter = http$1;
  }
}

plugin.request = http$1;

module.exports = plugin;
