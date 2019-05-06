import sleep from 'celia/sleep';
import tammy from '../src/index';
import http from '../src/plugins/http';

const nodeHttp = require('http');

describe('测试 http', () => {
  const url = 'http://api.map.baidu.com/place/v2/search?query=ATM%E6%9C%BA&tag=%E9%93%B6%E8%A1%8C&region=%E5%8C%97%E4%BA%AC&output=json';

  const url2 = 'http://biz.ziztour.net/dologin.do';

  const url3 = 'http://localhost:8789/sleep200';

  const url4 = 'http://localhost:8789/sleep2000';
  let server;

  beforeAll(() => {
    tammy.use(http);
    server = nodeHttp.createServer(async (req, res) => {
      switch (req.url) {
        case '/sleep200':
          await sleep(200);
          break;
        case '/sleep2000':
          await sleep(2000);
          break;
      }
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.statusCode = 200;
      res.end(JSON.stringify({ code: 9999, message: '测试' }));
    });
    server.on('listening', () => {
      console.log('The server is running at port 8789');
    });
    server.listen(8789);
  });

  it('测试get请求', async () => {
    const { data } = await tammy(url);
    expect(data).toEqual(
      expect.objectContaining({
        status: expect.any(Number),
        message: expect.any(String)
      })
    );
  });

  it('测试post请求', async () => {
    const { data } = await tammy(url2, {
      method: 'POST',
      data: {
        loginname: 'abc@163.com',
        loginpwd: 123456,
        randCode: '',
        checkRandcode: 0
      }
    });
    expect(data).toEqual(
      expect.objectContaining({
        statusCode: expect.any(Number),
        message: expect.any(String)
      })
    );
  });

  it('测试abort', () => {
    let abortedToken;
    const promise = tammy(url2, {
      method: 'POST',
      data: {
        loginname: 'abc@163.com',
        loginpwd: 123456,
        randCode: '',
        checkRandcode: 0
      },
      abortion(token) {
        abortedToken = token;
      }
    });
    tammy.abort(abortedToken, '中断请求');
    return expect(promise)
      .rejects
      .toThrow('中断请求');
  });

  it('测试abort2', async () => {
    let abortedToken;
    const promise = tammy(url2, {
      method: 'POST',
      data: {
        loginname: 'abc@163.com',
        loginpwd: 123456,
        randCode: '',
        checkRandcode: 0
      },
      abortion(token) {
        abortedToken = token;
      }
    });
    await sleep(50);
    tammy.abort(abortedToken, '中断请求2');
    await expect(promise)
      .rejects
      .toThrow('中断请求2');
  });

  it('测试abort3', async () => {
    let abortedToken;
    const promise = tammy(url3, {
      abortion(token) {
        abortedToken = token;
      }
    });
    await sleep(200);
    tammy.abort(abortedToken, '中断请求3');
    await expect(promise)
      .rejects
      .toThrow('中断请求3');
  });

  it('测试abort4', async () => {
    let abortedToken;
    const promise = tammy(url4, {
      abortion(token) {
        abortedToken = token;
      }
    });
    await sleep(1000);
    tammy.abort(abortedToken, '中断请求4');
    await expect(promise)
      .rejects
      .toThrow('中断请求4');
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      server.on('close', resolve);
      server.close();
    });
    // await sleep(200);
  });
});
