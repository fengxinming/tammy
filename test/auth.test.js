import tammy from '../src/index';
import auth from '../src/plugins/auth';
import { makeXHR } from './util';

describe('测试 oauth', () => {

  let url = 'https://github.com/fengxinming?cat=famous&count=10';

  const originalXMLHttpRequest = window.XMLHttpRequest;

  beforeAll(() => {
    // 模拟 response 为空
    window.XMLHttpRequest = makeXHR({
      response: null,
      responseText: '测试parse后的异常情况'
    });
  });

  it('测试oauth认证', async () => {
    tammy.use(auth);

    // 防重复加载
    tammy.use(auth);

    await tammy({
      method: 'POST',
      url,
      auth: {
        username: 'abc',
        password: '123'
      }
    }).then(({ options }) => {
      expect(options.headers.Authorization).toBe('Basic YWJjOjEyMw==');
    });

    await tammy({
      method: 'POST',
      url,
      auth: {
        username: null,
        password: null
      }
    }).then(({ options }) => {
      expect(options.headers.Authorization).toBe('Basic Og==');
    });

    await tammy({
      method: 'POST',
      url,
      auth: null
    }).then(({ data }) => {
      expect(data).toBe('测试parse后的异常情况');
    });
  });

  afterAll(() => {
    window.XMLHttpRequest = originalXMLHttpRequest();
  });

});
