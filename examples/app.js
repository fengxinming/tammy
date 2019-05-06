'use strict';

const { join } = require('path');
const Koa = require('koa');
const { Router } = require('koay-router');
const serve = require('koa-static');
const { sleep } = require('celia');

const app = new Koa();
const router = new Router();
router.get('/api/sleep200', async (ctx) => {
  await sleep(200);
  ctx.body = { code: 200 };
});
router.get('/api/sleep2000', async (ctx) => {
  await sleep(2000);
  ctx.body = { code: 200 };
});
app.use(serve(join(__dirname, 'public')));
app.use(router.middleware());
const server = app.listen(5000);
server.on('listening', () => {
  console.log('The server is running at port 5000');
});
