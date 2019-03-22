import tammy from '../src/index';
import xsrf from '../src/xsrf';
import { makeXHR } from './util';

describe('测试 xsrf', () => {

  let url = 'https://github.com/fengxinming?cat=famous&count=10';

  const originalXMLHttpRequest = window.XMLHttpRequest;

  beforeAll(() => {
    // 模拟 response.responseType 出现异常
    window.XMLHttpRequest = makeXHR({
      responseType: new Error('设置responseType异常')
    });
  });

  it('测试主方法', async () => {
    tammy.use(xsrf);

    await tammy({
      method: 'POST',
      url
    }).then(({ data }) => {
      expect(data).toEqual(
        expect.objectContaining({
          code: expect.any(Number),
          message: expect.any(String)
        })
      );
    });
  });

  afterAll(() => {
    window.XMLHttpRequest = originalXMLHttpRequest();
  });

});
