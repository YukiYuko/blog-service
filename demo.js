const koa = require("koa");
const app = new koa();
const session = require('koa-session');

app.keys = ['some secret hurr'];
const CONFIG = {
  key: 'koa:sess',   //cookie key (default is koa:sess)
  maxAge: 86400000,  // cookie的过期时间 maxAge in ms (default is 1 days)
  overwrite: true,  //是否可以overwrite    (默认default true)
  httpOnly: true, //cookie是否只有服务器端可以访问 httpOnly or not (default true)
  signed: true,   //签名默认true
  rolling: true,  //在每次请求时强行设置cookie，这将重置cookie过期时间（默认：false）
  renew: true,  //(boolean) renew session when session is nearly expired,
};
app.use(session(CONFIG, app));

app.use( async (ctx) => {
  let n = ctx.session.views || 0;
  ctx.session.views = ++n;
  ctx.body = n + ' views';
});

app.listen(port = 3200, () => {
  console.log(`服务启动成功，端口号： ${port}`);
});