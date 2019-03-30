/*!
 * tammy.js v1.0.0-beta.5
 * (c) 2018-2019 Jesse Feng
 * Released under the MIT License.
 */
'use strict';

function index (ref) {
  var internalHooks = ref.internalHooks;

  if (window && window.window === window) {
    internalHooks.request.use(function (options) {
      // HTTP basic authentication
      var auth = options.auth;
      var headers = options.headers;
      if (auth) {
        var username = auth.username || '';
        var password = auth.password || '';
        headers.Authorization = 'Basic ' + window.btoa(username + ':' + password);
      }
      return options;
    });
  }
}

module.exports = index;
