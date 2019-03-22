/*!
 * tammy.js v1.0.0
 * (c) 2018-2019 Jesse Feng
 * Released under the MIT License.
 */
'use strict';

function index (ref) {
  var xhrHeaderHooks = ref.xhrHeaderHooks;

  xhrHeaderHooks[xhrHeaderHooks.length] = function (ref) {
    var auth = ref.auth;
    var headers = ref.headers;

    // HTTP basic authentication
    if (auth) {
      var username = auth.username || '';
      var password = auth.password || '';
      headers.Authorization = 'Basic ' + window.btoa(username + ':' + password);
    }
  };
}

module.exports = index;
