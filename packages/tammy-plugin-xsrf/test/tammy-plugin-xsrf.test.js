import { http } from '../../tammy/src';
import xsrf from '../src';
import xhr from '../../tammy-adapter-xhr/src';
import { makeXHR } from '../../../test/util';

describe('测试 tammy-plugin-xsrf', () => {

  let url = 'https://github.com/fengxinming?cat=famous&count=10';

  const originalXMLHttpRequest = window.XMLHttpRequest;

  beforeAll(() => {
    // 模拟 response.responseType 出现异常
    window.XMLHttpRequest = makeXHR({
      responseType: new Error('设置responseType异常')
    });
    http.defaults.adapter = xhr;
    http.install(xsrf);
    http.install(xsrf);
  });

  it('测试xsrf', async () => {
    await http({
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
