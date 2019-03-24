export default {
  timeout: 0,
  responseType: 'json', // 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  maxContentLength: -1,
  validateStatus(status) {
    return (status >= 200 && status < 300) || status === 304;
  }
};
