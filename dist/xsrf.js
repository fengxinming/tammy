/*!
 * tammy.js v1.0.0-beta.5
 * (c) 2018-2019 Jesse Feng
 * Released under the MIT License.
 */
'use strict';

function isNumber (value) {
  return typeof value === 'number';
}

function isString (value) {
  return typeof value === 'string';
}

function isNil (value) {
  /* eslint eqeqeq: 0 */
  return value == null;
}

function isStandardBrowserEnv() {
  if (!isNil(navigator) && (navigator.product === 'ReactNative' ||
    navigator.product === 'NativeScript' ||
    navigator.product === 'NS')) {
    return false;
  }
  return (!isNil(window) && !isNil(document));
}

var isURLSameOrigin = isStandardBrowserEnv() ?

  (function standardBrowserEnv() {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement('a');
    var originURL;

    function resolveURL(url) {
      var href = url;

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
      var parsed = (isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
        parsed.host === originURL.host);
    };
  })() :

  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })();

var cookies = {
  set: function set() { },
  get: function get() { return null; },
  remove: function remove() { }
};

if (isStandardBrowserEnv) {
  cookies.set = function set(name, value, expires, path, domain, secure) {
    var cookie = [];
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
    var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return (match ? decodeURIComponent(match[3]) : null);
  };

  cookies.remove = function remove(name) {
    this.write(name, '', Date.now() - 86400000);
  };
}

function index (ref) {
  var internalHooks = ref.internalHooks;

  if (window && window.window === window) {
    internalHooks.request.use(function (options) {
      var url = options.url;
      var headers = options.headers;
      var withCredentials = options.withCredentials;
      var xsrfCookieName = options.xsrfCookieName; if ( xsrfCookieName === void 0 ) xsrfCookieName = 'XSRF-TOKEN';
      var xsrfHeaderName = options.xsrfHeaderName; if ( xsrfHeaderName === void 0 ) xsrfHeaderName = 'X-XSRF-TOKEN';

      // 判断是浏览器环境
      if (isStandardBrowserEnv()) {
        // 增加 xsrf header
        var xsrfValue = (withCredentials || isURLSameOrigin(url)) && xsrfCookieName ?
          cookies.get(xsrfCookieName) :
          undefined;

        if (xsrfValue) {
          headers[xsrfHeaderName] = xsrfValue;
        }
      }

      return options;
    });
  }
}

module.exports = index;
