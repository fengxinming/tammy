import tammy from '../src/index';
import http from '../src/http';

describe('测试 http', () => {
  const url = 'http://api.map.baidu.com/place/v2/search?query=ATM%E6%9C%BA&tag=%E9%93%B6%E8%A1%8C&region=%E5%8C%97%E4%BA%AC&output=json';
  beforeAll(() => {
    tammy.use(http);
  });

  it('测试ge请求', async () => {
    await tammy(url)
      .then(({ data }) => {
        expect(data).toEqual(
          expect.objectContaining({
            status: expect.any(Number),
            message: expect.any(String)
          })
        );
      });
  });
});
