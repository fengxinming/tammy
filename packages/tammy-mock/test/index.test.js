import { http } from '../../tammy/src';
import Mock from '../src';

describe('测试 tammy-mock', () => {

  let url;
  beforeAll(() => {
    url = '/api/test';

    const mock = new Mock();
    mock.get(url, (req, res) => {
      res.json({
        code: 0,
        message: 'success'
      });
    });
    mock.post(url, (req, res) => {
      res.json({
        code: 0,
        message: 'success'
      });
    });
    http.defaults.adapter = mock.getAdapter();
  });

  describe('测试默认 http 实例', () => {
    describe('测试 get 请求', () => {
      it('测试无参请求', () => {
        http
          .get(url)
          .then(({ data }) => {
            expect(data).toEqual(
              expect.objectContaining({
                code: expect.any(Number),
                message: expect.any(String)
              })
            );
          });
      });

      it('测试有参请求', () => {
        http
          .get(url, {
            aa: 'aa',
            bb: 'bb'
          })
          .then(({ data, config }) => {
            expect(config.url).toEqual(
              expect.stringContaining('aa=aa')
            );
            expect(config.url).toEqual(
              expect.stringContaining('bb=bb')
            );
            expect(data).toEqual(
              expect.objectContaining({
                code: expect.any(Number),
                message: expect.any(String)
              })
            );
          });
      });

      it('测试 qs 参数', () => {
        http(url, {
          qs: {
            aa: 'aa',
            bb: 'bb'
          }
        }).then(({ data, config }) => {
          expect(config.url).toEqual(
            expect.stringContaining('aa=aa')
          );
          expect(config.url).toEqual(
            expect.stringContaining('bb=bb')
          );
          expect(data).toEqual(
            expect.objectContaining({
              code: expect.any(Number),
              message: expect.any(String)
            })
          );
        });

        http(url, {
          qs: 'aa=aa&bb=bb'
        }).then(({ data, config }) => {
          expect(config.url).toEqual(
            expect.stringContaining('aa=aa')
          );
          expect(config.url).toEqual(
            expect.stringContaining('bb=bb')
          );
          expect(data).toEqual(
            expect.objectContaining({
              code: expect.any(Number),
              message: expect.any(String)
            })
          );
        });
      });

      it('测试 data 参数', () => {
        http(url, {
          data: {
            aa: 'aa',
            bb: 'bb'
          }
        }).then(({ data, config }) => {
          expect(config.url).toEqual(
            expect.stringContaining('aa=aa')
          );
          expect(config.url).toEqual(
            expect.stringContaining('bb=bb')
          );
          expect(data).toEqual(
            expect.objectContaining({
              code: expect.any(Number),
              message: expect.any(String)
            })
          );
        });
      });
    });

    describe('测试 post 请求', () => {
      it('通用 post 请求', () => {
        http({
          url,
          method: 'POST'
        }).then(({ data }) => {
          expect(data).toEqual(
            expect.objectContaining({
              code: expect.any(Number),
              message: expect.any(String)
            })
          );
        });
      });

      it('简化 post 请求', () => {
        http.post(url, {
          aa: 'aa',
          bb: 'bb'
        }).then(({ data, config }) => {
          expect(config.data).toEqual(
            expect.stringContaining('aa=aa')
          );
          expect(config.data).toEqual(
            expect.stringContaining('bb=bb')
          );
          expect(data).toEqual(
            expect.objectContaining({
              code: expect.any(Number),
              message: expect.any(String)
            })
          );
        });
      });
    });
  });
});
