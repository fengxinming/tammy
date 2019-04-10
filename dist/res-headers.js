/*!
 * tammy.js v1.0.0-beta.8
 * (c) 2018-2019 Jesse Feng
 * Released under the MIT License.
 */
'use strict';

var rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg;
function parseRawHeaders(rawHeaders) {
  var responseHeaders = {};
  var match;
  while ((match = rheaders.exec(rawHeaders))) {
    responseHeaders[match[1].toLowerCase()] = match[2];
  }
  return responseHeaders;
}

function index (ref) {
  var internalHooks = ref.internalHooks;

  if (window && window.XMLHttpRequest) {
    internalHooks.response.use(function (response) {
      var request = response.request;
      var options = response.options;
      var getAllResponseHeaders = options.getAllResponseHeaders;
      if (getAllResponseHeaders && request.getAllResponseHeaders) {
        response.headers = parseRawHeaders(request.getAllResponseHeaders());
      }
      return response;
    });
  }
}

module.exports = index;
