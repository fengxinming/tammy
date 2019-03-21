import isNumber from 'celia/es/isNumber';
import isString from 'celia/es/isString';
import { isStandardBrowserEnv } from './util';

const cookies = {
  set: function write() { },
  get: function read() { return null; },
  remove: function remove() { }
};

if (isStandardBrowserEnv) {
  cookies.set = function set(name, value, expires, path, domain, secure) {
    let cookie = [];
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
    let match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return (match ? decodeURIComponent(match[3]) : null);
  };

  cookies.remove = function remove(name) {
    this.write(name, '', Date.now() - 86400000);
  };
}

export default cookies;
