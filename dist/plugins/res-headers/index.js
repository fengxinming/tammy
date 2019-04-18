const rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg;
function parseRawHeaders(rawHeaders) {
  const responseHeaders = {};
  let match;
  while ((match = rheaders.exec(rawHeaders))) {
    responseHeaders[match[1].toLowerCase()] = match[2];
  }
  return responseHeaders;
}

export default function ({ internalHooks }) {
  if (window && window.XMLHttpRequest) {
    internalHooks.response.use((response) => {
      const { request, options } = response;
      const { getAllResponseHeaders } = options;
      if (getAllResponseHeaders && request.getAllResponseHeaders) {
        response.headers = parseRawHeaders(request.getAllResponseHeaders());
      }
      return response;
    });
  }
}
