import nativeHttp from 'http';
import { http, cancel, cancelAll, isCancelled, CT_JSON } from '../../tammy/src';
import requestAdapter from '../index';
import { sleep, _repeat } from 'celia';

describe('测试 tammy-adapter-request', () => {

  beforeAll(() => {
    http.defaults.adapter = requestAdapter;
  });

  let url = 'http://hotel.ziztour.net/login';
  let url2 = 'https://api.map.baidu.com/location/ip?ak=E4805d16520de693a3fe707cdc962045';

  describe('测试默认 http 实例', () => {
    it('http协议请求', () => {
      return http({
        url,
        method: 'POST',
        data: {
          username: randomPhoneNo(),
          password: randomCode()
        },
        gzip: true
      }).catch((err) => {
        expect(err.data).toEqual(
          expect.objectContaining({
            code: expect.any(Number),
            message: expect.any(String)
          })
        );
      });
    });

    it('https协议', () => {
      return http({
        url: url2,
        gzip: true
      }).catch((err) => {
        expect(err.data).toEqual(
          expect.objectContaining({
            status: 220,
            message: expect.any(String)
          })
        );
      });
    });

    describe('测试终止请求', () => {
      let server;
      let url3 = 'http://localhost:3456';
      beforeAll(async () => {
        await new Promise((resolve) => {
          server = nativeHttp.createServer(async (req, res) => {
            await sleep(60000);
            res.statusCode = 200;
            res.setHeader('Content-Type', CT_JSON);
            res.end(JSON.stringify({
              code: 0,
              message: 'success'
            }));
          });
          server.on('listening', resolve);
          server.listen(3456);
        });
      });

      it('测试终止请求后的异常判断', async () => {
        let token;
        setTimeout(() => {
          cancel(token, '测试终止请求');
          cancel();
        }, 100);
        return http({
          url: url3,
          cancelToken(t) {
            token = t;
          },
          method: 'POST',
          contentType: 'json',
          data: {
            aa: 'aa',
            bb: 'bb'
          }
        }).catch((e) => {
          return expect(isCancelled(e)).toBe(true);
        });
      });

      it('测试终止请求后的默认异常信息', () => {
        let token;
        setTimeout(() => {
          cancel(token);
        }, 100);
        return expect(http({
          url: url3,
          cancelToken(t) {
            token = t;
          },
          method: 'POST',
          contentType: 'json',
          data: {
            aa: 'aa',
            bb: 'bb'
          }
        })).rejects.toThrow('Request cancelled');
      });

      it('测试终止请求后的默认异常信息2', () => {
        let token;
        setTimeout(() => {
          cancel(token, {});
        }, 100);
        return expect(http({
          url: url3,
          cancelToken(t) {
            token = t;
          },
          method: 'POST',
          contentType: 'json',
          data: {
            aa: 'aa',
            bb: 'bb'
          }
        })).rejects.toThrow('Request cancelled');
      });

      it('测试终止所有的请求', () => {
        setTimeout(() => {
          cancelAll({ message: '测试终止所有的请求' });
        }, 100);

        return expect(http.all([{
          url: url3,
          method: 'POST',
          contentType: 'json',
          data: {
            aa: 'aa',
            bb: 'bb'
          }
        }, {
          url: url3,
          method: 'POST',
          contentType: 'json',
          data: {
            aa: 'aa',
            bb: 'bb'
          }
        }])).rejects.toThrow('测试终止所有的请求');
      });

      afterAll(async () => {
        await new Promise((resolve) => {
          server.on('close', resolve);
          server.close();
        });
        await sleep(50);
      });
    });
  });
});

function randomPhoneNo() {
  let phone = '13';
  _repeat(0, 10, () => {
    phone += Math.random() * 10 >>> 0;
  });
  return phone;
}

function randomCode() {
  let code = '';
  _repeat(0, 4, () => {
    code += Math.random() * 10 >>> 0;
  });
  return code;
}
