import tammy from '../src/index';

describe('测试 tammy', () => {

  function makeXHR(opts) {
    const xhrMockClass = () => {
      const response = {
        code: 0,
        message: 'success'
      };
      const xhr = Object.assign({
        open: jest.fn(),
        send: jest.fn(),
        abort: jest.fn(),
        setRequestHeader: jest.fn(),
        addEventListener: jest.fn(),
        upload: {
          addEventListener: jest.fn()
        },
        readyState: 4,
        status: 200,
        responseText: JSON.stringify(response),
        response
      }, opts);
      setTimeout(() => {
        xhr.onreadystatechange();
      }, 200);
      return xhr;
    };

    return jest.fn().mockImplementation(xhrMockClass);
  }

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
    newTammy.beforeRequest((options) => {
      options.headers = { 'X-SB': 'SB' };
      return options;
    });
    newTammy.afterResponse((res) => {
      const { options } = res;
      expect(options.headers['X-SB']).toBe('SB');
      return res;
    });
    await newTammy(url);
  });

  it('测试设置请求头', async () => {
    newTammy.setDefaultHeader('X-SB', 'SB');
    newTammy.setDefaultHeader('Content-Type', '');
    newTammy.setDefaultHeader('Content-Type', 'json', 'post');
    newTammy.setDefaultHeader('Content-Type', 'form', 'aaa');
  });

  it('测试终止请求', async () => {
    const abortion = new tammy.Abortion();
    setTimeout(() => {
      abortion.abort('主动中断');
    }, 100);
    try {
      await tammy({
        url,
        abortion,
        method: 'POST',
        contentType: 'json',
        data: {
          aa: 'aa',
          bb: 'bb'
        }
      });
    } catch (error) {
      expect(error.message).toBe('主动中断');
    }
  });
});
