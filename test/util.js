import type from 'celia/type';

export function makeXHR(opts) {
  const xhrMockClass = () => {
    const response = {
      code: 0,
      message: 'success'
    };
    const xhr = Object.assign({
      open: jest.fn(),
      send() {
        setTimeout(xhr.onreadystatechange, 300);
      },
      abort: jest.fn(),
      setRequestHeader: jest.fn(),
      addEventListener: jest.fn(),
      upload: {
        addEventListener: jest.fn()
      },
      getAllResponseHeaders() {
        return `
Content-Length: 329
Content-Type: application/json;charset=utf-8
Date: Fri, 22 Mar 2019 13:19:03 GMT
Keep-Alive: timeout=180
params-event-id: bb4339e1729f45a78620644329095deb
Strict-Transport-Security: max-age=31536000`;
      },
      readyState: 4,
      status: 200,
      responseText: JSON.stringify(response),
      response
    }, opts);
    if (type(xhr.responseType) === 'error') {
      Object.defineProperty(xhr, 'responseType', {
        enumerable: false,
        writable: false,
        configurable: false,
        value: null
      });
    }
    if (opts && opts.timeout) {
      setTimeout(() => {
        xhr.ontimeout();
      }, opts.timeout);
    }
    if (opts && opts.error) {
      setTimeout(() => {
        xhr.onerror();
      }, 200);
    }
    return xhr;
  };

  return jest.fn().mockImplementation(xhrMockClass);
}
