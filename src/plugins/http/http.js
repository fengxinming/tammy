import isFunction from 'celia/es/isFunction';
import append from 'celia/es/array/append';
import { push, managers } from '../../lib/abort';

const { URL } = require('url');
const http = require('http');
const https = require('https');
const zlib = require('zlib');
const clrsole = require('clrsole');

const RHTTPS = /https:?/;
const logger = clrsole.getLogger('Tammy');

function clearAbortions(abortedToken) {
  if (abortedToken) {
    delete managers[abortedToken];
  }
}

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
  let json = buf.toString(encoding);
  try {
    json = JSON.parse(json);
  } catch (e) {
    logger.warn('Parse body error', e);
    json = buf;
  }
  return json;
}

export default function (options) {
  return new Promise((resolve, reject) => {
    let {
      url,
      method,
      data,
      headers,
      auth,
      abortion,
      socketPath,
      httpAgent,
      httpsAgent,
      responseEncoding,
      responseType,
      timeout
    } = options;

    // Parse url
    const parsed = new URL(url);
    const protocol = parsed.protocol || 'http:';
    let isHttpsRequest = RHTTPS.test(protocol);
    let agent = isHttpsRequest ? (httpsAgent || new https.Agent()) : httpAgent;

    const httpOptions = {
      path: parsed.pathname + parsed.search,
      method,
      headers,
      agent
    };

    // HTTP basic authentication
    if (auth) {
      let username = auth.username || '';
      let password = auth.password || '';
      auth = username + ':' + password;
    }
    if (!auth && parsed.auth) {
      let urlAuth = parsed.auth.split(':');
      let urlUsername = urlAuth[0] || '';
      let urlPassword = urlAuth[1] || '';
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

    const chunks = [];
    let contentLength = 0;
    let error;
    let abortedToken;

    const req = http.request(httpOptions, (res) => {
      // 主动中断请求
      abortedToken = push((e) => {
        error = e;
        req.abort();
      });
      if (isFunction(abortion)) {
        abortion(abortedToken);
      }

      res.on('data', (chunk) => {
        contentLength += chunk.length;
        append(chunks, chunk);
      });
      res.on('end', () => {
        // buffer
        let body = Buffer.concat(chunks, contentLength);

        if (error) {
          reject(Object.assign(error, {
            options,
            request: req
          }));
          error = null;
          clearAbortions(abortedToken);
          return;
        }

        clearAbortions(abortedToken);

        const response = {
          statusText: res.statusMessage,
          options,
          request: req,
          status: res.statusCode,
          headers: res.headers
        };

        decodeResponseBody(res, body, (err, buf) => {
          if (err) {
            reject(Object.assign(err, response));
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
                const contentType = res.headers['content-type'];
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

    req.on('error', (e) => {
      error = e;
      reject(Object.assign(error, {
        options,
        request: req
      }));
      error = null;
      clearAbortions(abortedToken);
    });

    // 处理post请求
    if (data) {
      req.write(data);
    }
    req.end();

  });
}
