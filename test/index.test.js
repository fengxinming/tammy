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
      params: {
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
      params: 'aa=aa&bb=bb',
      cache: false
    }).then(({ options }) => {
      expect(options.url.match(/[?&]_=[^&]*/g).length).toBe(1);
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
      baseURL: url2
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

    await tammy.map(url, url2).then(([{ data }]) => {
      expect(data).toEqual(
        expect.objectContaining({
          code: expect.any(Number),
          message: expect.any(String)
        })
      );
    });
  });

  it('测试拦截器', async () => {
    newTammy.use(({ interceptors }) => {
      interceptors.request.use((options) => {
        options.headers = { 'X-SB-X': 'SB' };
        return options;
      });
      interceptors.response.use((res) => {
        const { options } = res;
        expect(options.headers['X-SB-X']).toBe('SB');
        return res;
      });
    });
    await newTammy(url);
  });

  it('测试设置请求头', async () => {
    tammy.use(({ setHeader }) => {
      setHeader('X-SB', 'SB');
      setHeader('Content-Type', '');
      setHeader('Content-Type', 'json', 'post');
      setHeader('Content-Type', 'form', 'aaa');
    });
  });

  it('测试终止请求', async () => {
    let token;
    setTimeout(() => {
      tammy.abort(token, '测试终止请求');
    }, 100);
    try {
      await tammy({
        url,
        abortion(t) {
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
      expect(tammy.isAborted(e)).toBe(true);
    }

    await sleep(100);

    setTimeout(() => {
      tammy.abort(token);
    }, 100);
    try {
      await tammy({
        url,
        abortion(t) {
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
      expect(e.message).toBe('Request aborted');
    }

    sleep(100);

    setTimeout(() => {
      tammy.abortAll({ message: '测试终止请求2' });
    }, 100);

    await expect(tammy.map({
      url,
      abortion(t) {
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
        abortion(t) {
          token = t;
        },
        method: 'POST',
        contentType: 'json',
        data: {
          aa: 'aa',
          bb: 'bb'
        }
      })).rejects.toEqual(
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
      expect(e.code).toBe('ETIMEOUT');
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

  afterAll(() => {
    window.XMLHttpRequest = originalXMLHttpRequest();
  });
});
