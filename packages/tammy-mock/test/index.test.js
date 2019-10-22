import { http } from '../../tammy/src';
import Mock from '../src';

describe('测试 tammy-mock', () => {

  beforeAll(() => {
    const mock = new Mock();
    mock.get('/api/test', (req, res) => {
      res.json({
        code: 0,
        message: 'success'
      });
    });
    mock.post('/api/test', (req, res) => {
      res.json({
        code: 0,
        message: 'success'
      });
    });
    http.defaults.adapter = mock.getAdapter();
  });

  let url = '/api/test';

  it('测试 get 请求', async () => {
    await http
      .get(url)
      .then(({ data }) => {
        expect(data).toEqual(
          expect.objectContaining({
            code: expect.any(Number),
            message: expect.any(String)
          })
        );
      });

    await http
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

    await http(url, {
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

    await http(url, {
      qs: 'aa=aa&bb=bb',
      cache: false
    }).then(({ config }) => {
      expect(config.url.match(/[?&]_=[^&]*/g).length).toBe(1);
    });
  });

  it('测试 post 请求', async () => {
    await http({
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

    await http.post(url, {
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
});
