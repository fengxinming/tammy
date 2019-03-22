import { assign } from './util';

export const CONTENT_TYPES = {
  json: 'application/json; charset=UTF-8',
  form: 'application/x-www-form-urlencoded; charset=UTF-8',
  multipart: 'multipart/form-data; charset=UTF-8'
};

const DEFAULT_POST_HEADERS = {
  'Content-Type': CONTENT_TYPES.form
};

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

export const defaultHeaders = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

['DELETE', 'GET', 'HEAD'].forEach((method) => {
  defaultHeaders[method] = {};
});

['POST', 'PUT', 'PATCH'].forEach((method) => {
  defaultHeaders[method] = assign({}, DEFAULT_POST_HEADERS);
});
