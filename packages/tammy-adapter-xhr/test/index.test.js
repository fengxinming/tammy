import { http as request, create, cancel, cancelAll, isCancelled } from '../../tammy/src';
import xhr from '../src';
import { makeXHR } from '../../../test/util';
import { sleep } from 'celia';

describe('测试 tammy-adapter-xhr', () => {

  const originalXMLHttpRequest = window.XMLHttpRequest;

  beforeAll(() => {
    window.XMLHttpRequest = makeXHR();
    request.defaults.adapter = xhr;
  });

  let url = 'https://github.com/fengxinming?cat=famous&count=10';
  let url2 = 'https://github.com/fengxinming';
  let url3 = '/api/test';
  let newTammy;

  it('测试 get 请求', async () => {
    await request
      .get(url)
      .then(({ data }) => {
        expect(data).toEqual(
          expect.objectContaining({
            code: expect.any(Number),
            message: expect.any(String)
          })
        );
      });

    await request
      .get(url, {
        aa: 'aa',
        bb: 'bb'
      })
      .then(({ data }) => {
        expect(data).toEqual(
          expect.objectContaining({
            code: expect.any(Number),
            message: expect.any(String)
          })
        );
      });

    await request(url, {
      qs: {
        aa: 'aa',
        bb: 'bb'
      }
    }).then(({ data }) => {
      expect(data).toEqual(
        expect.objectContaining({
          code: expect.any(Number),
          message: expect.any(String)
        })
      );
    });

    await request(url, {
      qs: 'aa=aa&bb=bb',
      cache: false
    }).then(({ config }) => {
      expect(config.url.match(/[?&]_=[^&]*/g).length).toBe(1);
    });
  });

  it('测试 post 请求', async () => {
    await request({
      method: 'POST',
      url,
      onDownloadProgress() { },
      onUploadProgress() { }
    }).then(({ data }) => {
      expect(data).toEqual(
        expect.objectContaining({
          code: expect.any(Number),
          message: expect.any(String)
        })
      );
    });

    await request.post(url, {
      aa: 'aa',
      bb: 'bb'
    }).then(({ data }) => {
      expect(data).toEqual(
        expect.objectContaining({
          code: expect.any(Number),
          message: expect.any(String)
        })
      );
    });
  });

  it('测试创建新的实例', async () => {
    newTammy = create({
      baseUrl: url2,
      adapter: xhr
    });
    await newTammy({
      url3,
      data: {
        aa: 'aa',
        bb: 'bb'
      }
    }).then(({ data }) => {
      expect(data).toEqual(
        expect.objectContaining({
          code: expect.any(Number),
          message: expect.any(String)
        })
      );
    });
  });

  it('测试处理 contentType', async () => {
    await request({
      url,
      method: 'POST',
      contentType: 'json',
      data: {
        aa: 'aa',
        bb: 'bb'
      }
    }).then(({ data }) => {
      expect(data).toEqual(
        expect.objectContaining({
          code: expect.any(Number),
          message: expect.any(String)
        })
      );
    });

    await request({
      url,
      headers: {
        'Content-Type': ''
      },
      method: 'POST',
      withCredentials: true,
      data: {
        aa: 'aa',
        bb: 'bb'
      }
    }).then(({ data }) => {
      expect(data).toEqual(
        expect.objectContaining({
          code: expect.any(Number),
          message: expect.any(String)
        })
      );
    });
  });

  it('测试并发请求', async () => {
    await request.all([url, url2]).then(([{ data }]) => {
      expect(data).toEqual(
        expect.objectContaining({
          code: expect.any(Number),
          message: expect.any(String)
        })
      );
    });
  });

  it('测试拦截器', async () => {
    const { request, response } = newTammy.interceptors;

    request.use((config) => {
      config.headers = { 'X-SB-X': 'SB' };
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
    expect(request.eject()).toBe(false);
    await newTammy(url);
  });

  it('测试设置请求头', async () => {
    request.headers.common['X-SB'] = 'SB';
    request.headers.common['Content-Type'] = '';
    request.headers.post['Content-Type'] = 'json';
  });

  describe('测试终止请求', () => {
    it('测试终止请求后的异常判断', async () => {
      let token;
      setTimeout(() => {
        cancel(token, '测试终止请求');
        cancel();
      }, 100);
      try {
        await request({
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
      await expect(request({
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
      await expect(request({
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

      await expect(request.all([{
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
      await request({
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
      await request({
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
      await request({
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
    return expect(request({
      url,
      validateStatus(status) {
        return !status;
      }
    })).rejects.toThrow('Request failed with status code 200');
  });

  it('测试auth认证', async () => {
    await request({
      method: 'POST',
      url,
      auth: {
        username: 'abc',
        password: '123'
      }
    }).then(({ config }) => {
      expect(config.headers.Authorization).toBe('Basic YWJjOjEyMw==');
    });

    await request({
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

  it('测试处理headers', async () => {
    await request({
      url,
      headers: {
        'Content-Type': ''
      },
      method: 'POST'
    }).then(({ headers }) => {
      expect(headers).toEqual(
        expect.objectContaining({
          'content-type': 'application/json;charset=utf-8'
        })
      );
    });
  });

  afterAll(() => {
    window.XMLHttpRequest = originalXMLHttpRequest();
  });
});
