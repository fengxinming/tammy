import tammy from '../src/index';
import { makeXHR } from './util';
import { sleep } from 'celia';

describe('测试 tammy', () => {

  const originalXMLHttpRequest = window.XMLHttpRequest;

  beforeAll(() => {
    window.XMLHttpRequest = makeXHR();
  });

  let url = 'https://github.com/fengxinming?cat=famous&count=10';
  let url2 = 'https://github.com/fengxinming';
  let url3 = '/api/test';
  let newTammy;

  it('测试 get 请求', async () => {
    await tammy
      .get(url)
      .then(({ data }) => {
        expect(data).toEqual(
          expect.objectContaining({
            code: expect.any(Number),
            message: expect.any(String)
          })
        );
      });

    await tammy
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

    await tammy(url, {
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

    await tammy(url, {
      qs: 'aa=aa&bb=bb',
      cache: false
    }).then(({ config }) => {
      expect(config.url.match(/[?&]_=[^&]*/g).length).toBe(1);
    });
  });

  it('测试 post 请求', async () => {
    await tammy({
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

    await tammy.post(url, {
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
    newTammy = tammy.create({
      baseUrl: url2
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
    await tammy({
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

    await tammy({
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
    await tammy.all([url, url2]).then(([{ data }]) => {
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
    request.eject(id);
    request.eject(1);
    request.eject();
    await newTammy(url);
  });

  it('测试设置请求头', async () => {
    tammy.headers.common['X-SB'] = 'SB';
    tammy.headers.common['Content-Type'] = '';
    tammy.headers.post['Content-Type'] = 'json';
  });

  it('测试终止请求', async () => {
    let token;
    setTimeout(() => {
      tammy.cancel(token, '测试终止请求');
      tammy.cancel();
    }, 100);
    try {
      await tammy({
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
      expect(tammy.isCancelled(e)).toBe(true);
    }

    await sleep(100);

    setTimeout(() => {
      tammy.cancel(token);
    }, 100);
    try {
      await tammy({
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
      expect(e.message).toBe('Request cancelled');
    }

    await sleep(100);

    setTimeout(() => {
      tammy.cancel(token, {});
    }, 100);
    try {
      await tammy({
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
      expect(e.message).toBe('Request cancelled');
    }

    await sleep(100);

    setTimeout(() => {
      tammy.cancelAll({ message: '测试终止请求2' });
    }, 100);

    await expect(tammy.all([{
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
    }, {
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
    }])).rejects.toEqual(
      expect.objectContaining({
        message: '测试终止请求2'
      })
    );

  });

  it('测试处理超时', async () => {
    window.XMLHttpRequest = makeXHR({ timeout: 100 });
    try {
      await tammy({
        url,
        headers: {
          'Content-Type': ''
        },
        method: 'POST',
        timeout: 100,
        getAllResponseHeaders: true
      });
    } catch (e) {
      expect(e.code).toBe('ECONNRESET');
    }
    window.XMLHttpRequest = makeXHR();
  });

  it('测试处理网络异常', async () => {
    window.XMLHttpRequest = makeXHR({ error: true });
    try {
      await tammy({
        url,
        headers: {
          'Content-Type': ''
        },
        method: 'POST',
        timeout: 100,
        getAllResponseHeaders: true
      });
    } catch (e) {
      expect(e.message).toBe('Network Error');
    }
    window.XMLHttpRequest = makeXHR();
  });

  it('测试中断请求', async () => {
    window.XMLHttpRequest = makeXHR({ abort: true });
    try {
      await tammy({
        url,
        headers: {
          'Content-Type': ''
        },
        method: 'POST',
        timeout: 100,
        getAllResponseHeaders: true
      });
    } catch (e) {
      expect(tammy.isAborted(e)).toBe(true);
    }
    window.XMLHttpRequest = makeXHR();
  });

  it('测试验证状态失败', async () => {
    try {
      await tammy({
        url,
        validateStatus(status) {
          return !status;
        }
      });
    } catch (e) {
      expect(e.message).toBe('Request failed with status code 200');
    }
  });

  it('测试auth认证', async () => {
    await tammy({
      method: 'POST',
      url,
      auth: {
        username: 'abc',
        password: '123'
      }
    }).then(({ config }) => {
      expect(config.headers.Authorization).toBe('Basic YWJjOjEyMw==');
    });

    await tammy({
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
    await tammy({
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
