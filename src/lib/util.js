import isNil from 'celia/es/isNil';
import isString from 'celia/es/isString';
import forIn from 'celia/es/forIn';
import forEach from 'celia/es/forEach';
import append from 'celia/es/array/append';
import isObject from 'celia/es/isObject';

const rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg;

export const assign = Object.assign || function (target) {
  if (isNil(target)) {
    throw new TypeError('Cannot convert undefined or null to object');
  }
  const to = Object(target);
  const args = arguments;
  forEach(args, (nextSource) => {
    forIn(nextSource, (nextValue, nextKey) => {
      to[nextKey] = nextValue;
    });
  });
  return to;
};

export function merge(result, ...args) {
  function cb(val, key) {
    if (isObject(val)) {
      let source = result[key];
      source = isObject(source) ? source : {};
      result[key] = merge(source, val);
    } else {
      result[key] = val;
    }
  }
  forEach(args, (arg) => {
    forIn(arg, cb);
  });
  return result;
}

export function parseRawHeaders(rawHeaders) {
  const responseHeaders = {};
  let match;
  while ((match = rheaders.exec(rawHeaders))) {
    responseHeaders[match[1].toLowerCase()] = match[2];
  }
  return responseHeaders;
}

export function isStandardBrowserEnv() {
  if (!isNil(navigator) && (navigator.product === 'ReactNative' ||
    navigator.product === 'NativeScript' ||
    navigator.product === 'NS')) {
    return false;
  }
  return (!isNil(window) && !isNil(document));
}

export const isURLSameOrigin = isStandardBrowserEnv() ?

  (function standardBrowserEnv() {
    const msie = /(msie|trident)/i.test(navigator.userAgent);
    const urlParsingNode = document.createElement('a');
    let originURL;

    function resolveURL(url) {
      let href = url;

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
      let parsed = (isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
        parsed.host === originURL.host);
    };
  })() :

  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })();

export function createError(message, options) {
  const error = new Error(message);
  assign(error, options);
  return error;
}

export function normalizeHeaderName(headers, normalizedName) {
  forIn(headers, (value, name) => {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
}

export function toFormString(obj) {
  const form = [];
  forIn(obj, (val, key) => {
    append(form, `${key}=${val}`);
  });
  return form.join('&');
}
