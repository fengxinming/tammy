import tammy from '../src/index';
import resHeaders from '../src/plugins/res-headers';
import { makeXHR } from './util';

describe('测试 oauth', () => {

  let url = 'https://github.com/fengxinming?cat=famous&count=10';

  const originalXMLHttpRequest = window.XMLHttpRequest;

  it('测试处理headers', async () => {
    window.XMLHttpRequest = makeXHR();

    tammy.use(resHeaders);

    // 防重复加载
    tammy.use(resHeaders);

    await tammy({
      url,
      headers: {
        'Content-Type': ''
      },
      method: 'POST',
      getAllResponseHeaders: true
    }).then(({ headers }) => {
      expect(headers).toEqual(
        expect.objectContaining({
          'content-type': 'application/json;charset=utf-8'
        })
      );
    });

    window.XMLHttpRequest = makeXHR({
      getAllResponseHeaders: null
    });

    await tammy({
      url,
      headers: {
        'Content-Type': ''
      },
      method: 'POST',
      getAllResponseHeaders: true
    }).then(({ headers }) => {
      expect(headers).toBe(undefined);
    });
  });

  afterAll(() => {
    window.XMLHttpRequest = originalXMLHttpRequest();
  });

});
