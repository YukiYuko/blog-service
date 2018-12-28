const Koa = require('koa');
const app = new Koa();
const session = require('koa-session');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const koaBody = require('koa-body');
const static = require('koa-static');
const koajwt = require('koa-jwt');
const path = require("path");
const {TOKEN_ENCODE_STR} = require('./config/index');
const port = 3002;
let News = require('./appApi/News');
let Users = require('./appApi/Users');
let Admin = require('./appApi/Admin');
let Upload = require('./appApi/Upload');
let System = require('./appApi/System');
let Comment = require('./appApi/Comment');
let Other = require('./appApi/Other');
let router = new Router();
//引入connect
const {connect} = require('./database/init.js');


//立即执行函数
;(async () =>{
  await connect();

  app.keys = ['some secret hurr'];
  const CONFIG = {
    key: 'koa:sess',   //cookie key (default is koa:sess)
    maxAge: 86400000,  // cookie的过期时间 maxAge in ms (default is 1 days)
    overwrite: true,  //是否可以overwrite    (默认default true)
    httpOnly: true, //cookie是否只有服务器端可以访问 httpOnly or not (default true)
    signed: true,   //签名默认true
    rolling: true,  //在每次请求时强行设置cookie，这将重置cookie过期时间（默认：false）
    renew: false,  //(boolean) renew session when session is nearly expired,
  };
  app.use(session(CONFIG, app));

  // 错误处理
  app.use((ctx, next) => {
    return next().catch((err) => {
      if(err.status === 401){
        ctx.status = 401;
        ctx.body = 'Protected resource, use Authorization header to get access\n';
      }else{
        throw err;
      }
    })
  });
  app.use(cors({
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
  }));
  app.use(koajwt({
    secret: TOKEN_ENCODE_STR
  }).unless({
    path: [/\/users/, /\/other/, /\/admin\/login/, /\/admin\/register/, /\/admin\/insertUsers/, /\/touxiang/]
  }));

  router.use('/news',News.routes());
  router.use('/users',Users.routes());
  router.use('/admin',Admin.routes());
  router.use('/upload',Upload.routes());
  router.use('/system',System.routes());
  router.use('/comment',Comment.routes());
  router.use('/other',Other.routes());


  // app.use(koaBody({
  //   multipart: true,
  //   formidable: {
  //     maxFileSize: 200*1024*1024 * 100   // 设置上传文件大小最大限制，默认2M
  //   }
  // }));
  app.use(bodyParser({
    jsonLimit: '20mb',
    textLimit: '20mb',
    formLimit: '20mb',
    enableTypes: ['json', 'form', 'text']
  }));
  app.use(router.routes());
  app.use(router.allowedMethods());
  //设置静态资源的路径 设置之后 路径上不要带有 public
  const staticPath = '/public';
  app.use(static(__dirname + staticPath));
})();


app.listen(port, () => {
    console.log(`服务启动成功，端口号： ${port}`);
});
