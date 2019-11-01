'use strict';

const { readFileSync } = require('fs');
const { join } = require('path');
const Koa = require('koa');
const { Router } = require('koay-router');
const serve = require('koa-static');
const { sleep } = require('celia');

const app = new Koa();
const router = new Router();
router.get('/tammy.js', (ctx) => {
  ctx.body = readFileSync(join(__dirname, '..', 'packages', 'tammy', 'npm', 'umd.js'));
  ctx.type = 'application/javascript; charset=utf-8';
});
router.get('/tammy-adapter-xhr.js', (ctx) => {
  ctx.body = readFileSync(join(__dirname, '..', 'packages', 'tammy-adapter-xhr', 'npm', 'umd.js'));
  ctx.type = 'application/javascript; charset=utf-8';
});
router.get('/api/sleep/:code', async (ctx) => {
  await sleep(+ctx.params.code);
  ctx.body = { code: 200 };
});
router.get('/api/json', (ctx) => {
  ctx.body = { code: 200, message: 'success' };
});
app.use(serve(join(__dirname, 'public')));
app.use(router.middleware());
const server = app.listen(5000);
server.on('listening', () => {
  console.log('The server is running at port 5000');
});
