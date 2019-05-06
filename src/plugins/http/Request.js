import append from 'kick-array/append';
import isObject from 'celia/isObject';
import isAbsolute from 'celia/url/isAbsolute';
import isString from 'celia/isString';

const { URL } = require('url');
const http = require('http');
const https = require('https');
const zlib = require('zlib');
const EventEmitter = require('events');
const clrsole = require('clrsole');

const RHTTPS = /https:?/;
const logger = clrsole.getLogger('Tammy');

/**
 * 解码buffer
 * @param {http.ServerResponse} res
 * @param {Buffer} body
 * @param {Function} cb
 */
function decodeResponseBody(res, body, cb) {
  if (body.length) {
    let contentEncoding = res.headers['content-encoding'];
    if (contentEncoding) {
      contentEncoding = contentEncoding.toLowerCase();
      // 解压
      switch (contentEncoding) {
        case 'gzip':
        case 'deflate':
          zlib.unzip(body, (err, data) => {
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
  let json = buf.toString(encoding);
  try {
    json = JSON.parse(json);
  } catch (e) {
    logger.warn('Parse body error', e);
    json = buf;
  }
  return json;
}

export default class Request extends EventEmitter {

  request(options) {

    let {
      protocol,
      host,
      family,
      port,
      localAddress,
      socketPath,
      method,
      path,
      headers,
      auth,
      agent,
      createConnection,
      timeout,
      setHost,

      // 扩展参数
      url,
      responseEncoding,
      responseType,
      data
    } = options;

    let error = null;
    let parsed;

    // 网络协议
    protocol = protocol || 'http:';
    url = url || path;
    if (!isString(url)) {
      error = new TypeError(`Invalid URL: ${url}`);
      error.code = 'ERR_INVALID_URL';
      throw error;
    }

    // HTTP basic authentication
    if (isObject(auth)) {
      let username = auth.username || '';
      let password = auth.password || '';
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

    let isHttpsRequest = RHTTPS.test(protocol);
    let defaultHttp = http;
    let defaultPort = 80;
    if (isHttpsRequest) {
      defaultHttp = https;
      defaultPort = 443;
    }

    const httpOptions = {
      protocol,
      method,
      headers,
      agent,
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

    const chunks = []; // buffer数组
    let contentLength = 0; // 接收到的内容长度
    let iRes = null; // 内部response对象
    let isAborted = false;

    const req = defaultHttp.request(httpOptions, (res) => {
      iRes = res;

      // 刚发起request请求
      this.emit('response', req, res, httpOptions, options);

      // 响应之后才触发 req.abort()
      res.on('aborted', () => {
        isAborted = true;
        this.emit('abort', null, req, res, httpOptions, options);
      });

      // 接收数据
      res.on('data', (chunk) => {
        contentLength += chunk.length;
        append(chunks, chunk);
      });

      // 数据接收完成
      res.on('end', () => {
        // 中途出现异常或者被中断请求，就不继续往下执行
        if (error || isAborted) {
          error = null;
          isAborted = false;
          return;
        }

        // buffer
        let body = Buffer.concat(chunks, contentLength);

        this.emit('received', body, req, res, httpOptions, options);

        decodeResponseBody(res, body, (err, buf) => {
          if (err) {
            // unzip 异常
            this.emit('error', err, req, res, httpOptions, options);
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
              const contentType = res.headers['content-type'];
              if (contentType.startsWith('application/json')) {
                body = parseJSON(buf, responseEncoding);
              } else if (contentType.startsWith('text')) {
                body = buf.toString(responseEncoding);
              } else {
                body = buf;
              }
          }

          this.emit('end', body, req, res, httpOptions, options);
        });
      });
    });

    // 请求了之后触发
    this.emit('request', req, iRes, httpOptions, options);

    // req.abort() 触发
    req.on('abort', () => {
      isAborted = true;
    });

    // 监听异常
    req.on('error', (e) => {
      error = e;
      this.emit(isAborted && e.code === 'ECONNRESET' ? 'abort' : 'error', e, req, iRes, httpOptions);
    });

    // 关闭连接
    req.on('close', () => {
      this.emit('close', req, iRes, httpOptions);
    });

    // 处理post请求
    if (data) {
      req.write(data);
    }

    // end后才会发起请求
    req.end();

    return this;
  }

}
