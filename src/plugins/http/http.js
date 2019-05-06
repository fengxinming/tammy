import Request from './Request';
import { ECONNABORTED } from '../../lib/constants';

export default function (options) {
  return new Promise((resolve, reject) => {
    const { _abortion } = options;

    const request = new Request();
    request
      .on('beforeRequest', () => {
        if (_abortion.state) {
          reject(Object.assign(_abortion.error, {
            options
          }));
          _abortion.remove();
        }
      })
      .on('request', (req) => {
        // 添加中断请求函数
        _abortion.push(() => req.abort());
      })
      .on('error', (err, req) => {
        reject(Object.assign(err, {
          options,
          request: req
        }));
        _abortion.remove();
      })
      .on('abort', (err, req) => {
        reject(Object.assign(_abortion.error || err, {
          options,
          request: req,
          code: ECONNABORTED
        }));
        _abortion.remove();
      })
      .on('end', (body, req, res) => {
        const response = {
          data: body,
          statusText: res.statusMessage,
          options,
          request: req,
          status: res.statusCode,
          headers: res.headers
        };
        _abortion.state ? reject(Object.assign(_abortion.error, response)) : resolve(response);
        _abortion.remove();
      })
      .request(options);

  });
}
