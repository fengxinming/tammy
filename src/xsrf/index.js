import cookies from './cookies';
import { isStandardBrowserEnv, isURLSameOrigin } from './util';

export default function ({ xhrHeaderHooks }) {
  xhrHeaderHooks[xhrHeaderHooks.length] = ({
    url,
    withCredentials,
    xsrfHeaderName,
    xsrfCookieName,
    headers
  }) => {
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
  };
}
