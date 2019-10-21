import { isNumber, isString, forOwn } from 'tammy';
import assign from 'celia/assign';
import mime from 'mime';

const STATUS_CODES = {
  '100': 'Continue',
  '101': 'Switching Protocols',
  '102': 'Processing',
  '103': 'Early Hints',
  '200': 'OK',
  '201': 'Created',
  '202': 'Accepted',
  '203': 'Non-Authoritative Information',
  '204': 'No Content',
  '205': 'Reset Content',
  '206': 'Partial Content',
  '207': 'Multi-Status',
  '208': 'Already Reported',
  '226': 'IM Used',
  '300': 'Multiple Choices',
  '301': 'Moved Permanently',
  '302': 'Found',
  '303': 'See Other',
  '304': 'Not Modified',
  '305': 'Use Proxy',
  '306': '(Unused)',
  '307': 'Temporary Redirect',
  '308': 'Permanent Redirect',
  '400': 'Bad Request',
  '401': 'Unauthorized',
  '402': 'Payment Required',
  '403': 'Forbidden',
  '404': 'Not Found',
  '405': 'Method Not Allowed',
  '406': 'Not Acceptable',
  '407': 'Proxy Authentication Required',
  '408': 'Request Timeout',
  '409': 'Conflict',
  '410': 'Gone',
  '411': 'Length Required',
  '412': 'Precondition Failed',
  '413': 'Payload Too Large',
  '414': 'URI Too Long',
  '415': 'Unsupported Media Type',
  '416': 'Range Not Satisfiable',
  '417': 'Expectation Failed',
  '418': "I'm a teapot",
  '421': 'Misdirected Request',
  '422': 'Unprocessable Entity',
  '423': 'Locked',
  '424': 'Failed Dependency',
  '425': 'Unordered Collection',
  '426': 'Upgrade Required',
  '428': 'Precondition Required',
  '429': 'Too Many Requests',
  '431': 'Request Header Fields Too Large',
  '451': 'Unavailable For Legal Reasons',
  '500': 'Internal Server Error',
  '501': 'Not Implemented',
  '502': 'Bad Gateway',
  '503': 'Service Unavailable',
  '504': 'Gateway Timeout',
  '505': 'HTTP Version Not Supported',
  '506': 'Variant Also Negotiates',
  '507': 'Insufficient Storage',
  '508': 'Loop Detected',
  '509': 'Bandwidth Limit Exceeded',
  '510': 'Not Extended',
  '511': 'Network Authentication Required'
};

const charsetRegExp = /;\s*charset\s*=/;

function lookupCharset(mimeType, fallback) {
  return (/^text\/|^application\/(javascript|json)/).test(mimeType) ? 'UTF-8' : fallback;
}

const specificCodes = [204, 304];
function specificCode(statusCode) {
  return specificCodes.indexOf(statusCode) > -1;
}

export class Response {

  constructor(opts) {
    assign(this, opts);

    const originalHeaders = this.headers;
    const headers = {};
    forOwn(originalHeaders, (val, key) => {
      headers[key.toLowerCase()] = val;
    });

    this._headers = originalHeaders;
    this.headers = headers;
    this.statusCode = 404;
    this.contentType = this.type;
    this.header = this.set;
  }

  setHeader(field, val) {
    this._headers[field] = val;
    this.headers[field.toLowerCase()] = val;
    return this;
  }

  removeHeader(name) {
    delete this._headers[name];
    delete this.headers[name.toLowerCase()];
  }

  getHeader(name) {
    return this.headers[name.toLowerCase()];
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  send(body) {
    let chunk = body;
    let encoding;
    let req = this.req;

    if (isNumber(chunk) && arguments.length === 1) {
      if (!this.get('Content-Type')) {
        this.type('txt');
      }

      this.statusCode = chunk;
      chunk = STATUS_CODES[chunk];
    }

    switch (typeof chunk) {
      case 'string':
        if (!this.get('Content-Type')) {
          this.type('html');
        }
        break;
      case 'boolean':
      case 'number':
      case 'object':
        if (chunk === null) {
          chunk = '';
        } else {
          return this.json(chunk);
        }
        break;
    }

    if (isString(chunk)) {
      encoding = 'utf8';
    }

    if (specificCode(this.statusCode)) {
      this.removeHeader('Content-Type');
      this.removeHeader('Content-Length');
      this.removeHeader('Transfer-Encoding');
      chunk = '';
    }

    if (req.method === 'HEAD') {
      this.end();
    } else {
      this.end(chunk, encoding);
    }

    return this;
  }

  json(obj) {
    if (!this.get('Content-Type')) {
      this.set('Content-Type', 'application/json');
    }

    return this.send(JSON.stringify(obj));
  }

  get(name) {
    if (!name) {
      throw new TypeError('name argument is required to res.get');
    }

    if (typeof name !== 'string') {
      throw new TypeError('name must be a string to res.get');
    }

    return this.getHeader(name);
  }

  set(field, val) {
    if (arguments.length === 2) {
      let value = Array.isArray(val)
        ? val.map(String)
        : String(val);

      if (field.toLowerCase() === 'content-type') {
        if (Array.isArray(value)) {
          throw new TypeError('Content-Type cannot be set to an Array');
        }
        if (!charsetRegExp.test(value)) {
          let charset = lookupCharset(value.split(';')[0]);
          if (charset) {
            value += '; charset=' + charset.toLowerCase();
          }
        }
      }

      this.setHeader(field, value);
    } else {
      for (let key in field) {
        this.set(key, field[key]);
      }
    }
    return this;
  }

  type(type) {
    let ct = type.indexOf('/') === -1
      ? mime.getType(type)
      : type;

    return this.set('Content-Type', ct);
  }

}
