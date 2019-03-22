import tammy from '../src/index';
import oauth from '../src/oauth';
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

  it('测试主方法', async () => {
    tammy.use(oauth);

    // 防重复加载
    tammy.use(oauth);

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
