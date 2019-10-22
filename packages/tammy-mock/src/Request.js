import assign from 'celia/assign';
import parseQuery from 'qs-like/parse';
import { forOwn } from 'tammy';

export class Request {

  constructor(opts) {
    assign(this, opts);

    const originalHeaders = this.headers;
    const headers = {};
    forOwn(originalHeaders, (val, key) => {
      headers[key.toLowerCase()] = val;
    });

    const xhr = this.get('X-Requested-With');
    const contentType = this.get('Content-Type');

    this._headers = originalHeaders;
    this.headers = headers;
    this.xhr = (xhr || '').toLowerCase() === 'xmlhttprequest';
    this.header = this.getHeader = this.get;
    this.query = parseQuery(this.url);
    this.body = ['POST', 'PUT', 'PATCH'].indexOf(this.method) > -1 &&
      contentType && contentType.indexOf('application/json') > -1
      ? JSON.parse(this._body || '{}')
      : parseQuery(this._body || '');

  }

  get(name) {
    if (!name) {
      throw new TypeError('name argument is required to req.get');
    }

    if (typeof name !== 'string') {
      throw new TypeError('name must be a string to req.get');
    }

    const lc = name.toLowerCase();

    switch (lc) {
      case 'referer':
      case 'referrer':
        return this.headers.referrer ||
          this.headers.referer;
      default:
        return this.headers[lc];
    }
  }

}
