/*!
 * tammy.js v1.0.0-beta.1
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
  var xhrHooks = ref.xhrHooks;

  xhrHooks.response.push(function (xhr, res, ref) {
    var getAllResponseHeaders = ref.getAllResponseHeaders;

    if (getAllResponseHeaders && xhr.getAllResponseHeaders) {
      res.headers = parseRawHeaders(xhr.getAllResponseHeaders());
    }
  });
}

module.exports = index;
