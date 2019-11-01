import { http, create, cancel, cancelAll, isCancelled, CT_JSON } from '../../tammy/src';
import xhr from '../src';
import { makeXHR } from '../../../test/util';
import { sleep } from 'celia';

describe('测试 tammy-adapter-xhr', () => {

  const originalXMLHttpRequest = window.XMLHttpRequest;

  beforeAll(() => {
    window.XMLHttpRequest = makeXHR();
    http.defaults.adapter = xhr;
  });

  const baseUrl = 'https://github.com/fengxinming';
  const url = 'https://github.com/fengxinming?cat=famous&count=10';
  const url2 = '/tammy';
  const url3 = '/api/test';

  describe('测试默认 http 实例', () => {
    describe('测试 get 请求', () => {
      it('测试无参请求', () => {
        return http
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
        return http
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

      it('测试 qs 参数', async () => {
        await http(url, {
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

        await http(url, {
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
        return http(url, {
          data: {
            aa: 'aa',
            bb: 'bb'
          },
          onDownloadProgress: () => { }
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
        return http({
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
        return http.post(url, {
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

      it('测试处理 requestType', async () => {
        await http({
          url,
          method: 'POST',
          requestType: 'json',
          data: {
            aa: 'aa',
            bb: 'bb'
          },
          onUploadProgress: () => { }
        }).then(({ config, data }) => {
          expect(JSON.parse(config.data)).toEqual({
            aa: 'aa',
            bb: 'bb'
          });
          expect(data).toEqual(
            expect.objectContaining({
              code: expect.any(Number),
              message: expect.any(String)
            })
          );
        });

        await http({
          url,
          headers: {
            'Content-Type': CT_JSON
          },
          method: 'POST',
          withCredentials: true,
          qs: {
            cc: 11
          },
          data: {
            aa: 'aa',
            bb: 'bb'
          }
        }).then(({ data, config }) => {
          expect(JSON.parse(config.data)).toEqual({
            aa: 'aa',
            bb: 'bb'
          });
          expect(data).toEqual(
            expect.objectContaining({
              code: expect.any(Number),
              message: expect.any(String)
            })
          );
        });
      });
    });

    it('测试并发请求', async () => {
      await http.all([url3, url2]).then(([res1, res2]) => {
        expect(res1.data).toEqual(
          expect.objectContaining({
            code: expect.any(Number),
            message: expect.any(String)
          })
        );
        expect(res2.data).toEqual(
          expect.objectContaining({
            code: expect.any(Number),
            message: expect.any(String)
          })
        );
      });
    });

    describe('测试终止请求', () => {
      it('测试终止请求后的异常判断', async () => {
        let token;
        setTimeout(() => {
          cancel(token, '测试终止请求');
          cancel();
        }, 100);
        try {
          await http({
            url,
            cancelToken(t) {
              token = t;
            },
            method: 'POST',
            contentType: 'json',
            data: {
              aa: 'aa',
              bb: 'bb'
            }
          });
        } catch (e) {
          expect(isCancelled(e)).toBe(true);
        }

        await sleep(100);
      });

      it('测试终止请求后的默认异常信息', async () => {
        let token;
        setTimeout(() => {
          cancel(token);
        }, 100);
        await expect(http({
          url,
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

        await sleep(100);
      });

      it('测试终止请求后的默认异常信息2', async () => {
        let token;
        setTimeout(() => {
          cancel(token, {});
        }, 100);
        await expect(http({
          url,
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
        await sleep(100);
      });

      it('测试终止所有的请求', async () => {
        setTimeout(() => {
          cancelAll({ message: '测试终止所有的请求' });
        }, 100);

        await expect(http.all([{
          url,
          method: 'POST',
          contentType: 'json',
          data: {
            aa: 'aa',
            bb: 'bb'
          }
        }, {
          url,
          method: 'POST',
          contentType: 'json',
          data: {
            aa: 'aa',
            bb: 'bb'
          }
        }])).rejects.toThrow('测试终止所有的请求');

        await sleep(100);
      });
    });

    it('测试处理超时', async () => {
      window.XMLHttpRequest = makeXHR({ timeout: 100 });
      try {
        await http({
          url,
          headers: {
            'Content-Type': ''
          },
          method: 'POST',
          timeout: 100
        });
      } catch (e) {
        expect(e.code).toBe('ECONNRESET');
      }
      window.XMLHttpRequest = makeXHR();
    });

    it('测试处理网络异常', async () => {
      window.XMLHttpRequest = makeXHR({ error: true });
      try {
        await http({
          url,
          headers: {
            'Content-Type': ''
          },
          method: 'POST',
          timeout: 100
        });
      } catch (e) {
        expect(e.message).toBe('Network Error');
      }
      window.XMLHttpRequest = makeXHR();
    });

    it('测试中断请求', async () => {
      window.XMLHttpRequest = makeXHR({ abort: true });
      try {
        await http({
          url,
          headers: {
            'Content-Type': ''
          },
          method: 'POST',
          timeout: 100
        });
      } catch (e) {
        expect(isCancelled(e)).toBe(true);
      }
      window.XMLHttpRequest = makeXHR();
    });

    it('测试验证状态失败', () => {
      return expect(http({
        url,
        validateStatus(status) {
          return !status;
        }
      })).rejects.toThrow('Request failed with status code 200');
    });

    it('测试auth认证', async () => {
      await http({
        method: 'POST',
        url,
        auth: {
          username: 'abc',
          password: '123'
        }
      }).then(({ config }) => {
        expect(config.headers.Authorization).toBe('Basic YWJjOjEyMw==');
      });

      await http({
        method: 'POST',
        url,
        auth: {
          username: null,
          password: null
        }
      }).then(({ config }) => {
        expect(config.headers.Authorization).toBe('Basic Og==');
      });
    });
  });

  describe('测试新建 http 实例', () => {
    let newHttp;

    beforeAll(() => {
      newHttp = create({
        baseUrl,
        adapter: xhr
      });
    });

    it('测试创建新的实例', async () => {
      await newHttp({
        url: url2,
        data: {
          aa: 'aa',
          bb: 'bb'
        }
      }).then(({ data, config }) => {
        expect(config.url).toBe(baseUrl + url2 + '?aa=aa&bb=bb');
        expect(data).toEqual(
          expect.objectContaining({
            code: expect.any(Number),
            message: expect.any(String)
          })
        );
      });
    });

    it('测试拦截器', async () => {
      const { request, response } = newHttp.interceptors;

      request.use((config) => {
        config.headers['X-SB-X'] = 'SB';
        return config;
      });
      response.use((res) => {
        const { config } = res;
        expect(config.headers['X-SB-X']).toBe('SB');
        expect(config.headers['X-SB-B']).toBe(undefined);
        return res;
      });
      const id = request.use((config) => {
        config.headers = { 'X-SB-B': 'S' };
        return config;
      });
      expect(request.eject(id)).toBe(true);
      expect(request.eject(123)).toBe(false);
      await newHttp(url).then(({ config }) => {
        expect(config.headers['X-SB-X']).toBe('SB');
        expect(config.headers['X-SB-B']).toBe(undefined);
      });
    });

    it('测试设置请求头', async () => {
      newHttp.headers.post['Content-Type'] = CT_JSON;
      newHttp.headers.common['X-SB'] = 'SB';

      await newHttp({
        url,
        method: 'POST',
        data: {
          aa: 'aa',
          bb: 'bb'
        },
        test: 'sb'
      }).then(({ data, config }) => {
        expect(JSON.parse(config.data)).toEqual({
          aa: 'aa',
          bb: 'bb'
        });
        expect(config.headers['X-SB']).toBe('SB');
        expect(data).toEqual(
          expect.objectContaining({
            code: expect.any(Number),
            message: expect.any(String)
          })
        );
      });
    });

  });

  afterAll(() => {
    window.XMLHttpRequest = originalXMLHttpRequest();
  });
});
