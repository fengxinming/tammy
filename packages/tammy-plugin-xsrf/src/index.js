import cookies from './cookies';
import { isStandardBrowserEnv, isURLSameOrigin } from './util';

export default function ({ interceptors }) {
  if (typeof window !== 'undefined' && window.window === window) {
    interceptors.request.use((options) => {
      const {
        url,
        headers,
        withCredentials,
        xsrfCookieName = 'XSRF-TOKEN',
        xsrfHeaderName = 'X-XSRF-TOKEN'
      } = options;

      // 判断是浏览器环境
      if (isStandardBrowserEnv()) {
        // 增加 xsrf header
        let xsrfValue = (withCredentials || isURLSameOrigin(url)) && xsrfCookieName ?
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
