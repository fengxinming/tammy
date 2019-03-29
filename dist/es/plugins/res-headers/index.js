const rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg;
function parseRawHeaders(rawHeaders) {
  const responseHeaders = {};
  let match;
  while ((match = rheaders.exec(rawHeaders))) {
    responseHeaders[match[1].toLowerCase()] = match[2];
  }
  return responseHeaders;
}

export default function ({ xhrHooks }) {
  xhrHooks.response.push((xhr, res, { getAllResponseHeaders }) => {
    if (getAllResponseHeaders && xhr.getAllResponseHeaders) {
      res.headers = parseRawHeaders(xhr.getAllResponseHeaders());
    }
  });
}
