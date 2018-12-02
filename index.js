const Koa = require('koa');
const app = new Koa();
const port = 3002;

app.use(async (ctx, next) => {
  ctx.body = '欢迎来到英雄联盟！'
});

app.listen(port, () => {
  console.log(`服务启动成功，端口号： ${port}`);
});
