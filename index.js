const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const koaBody = require('koa-body');
const static = require('koa-static');
const path = require("path");
const port = 3002;
let News = require('./appApi/News');
let Users = require('./appApi/Users');
let Upload = require('./appApi/Upload');
let System = require('./appApi/System');
let Comment = require('./appApi/Comment');
let router = new Router();
//引入connect
const {connect} = require('./database/init.js');
//立即执行函数
;(async () =>{
  await connect();
  // initSchemas();
  router.use('/news',News.routes());
  router.use('/users',Users.routes());
  router.use('/upload',Upload.routes());
  router.use('/system',System.routes());
  router.use('/comment',Comment.routes());

  app.use(koaBody({
    multipart: true,
    formidable: {
      maxFileSize: 200*1024*1024    // 设置上传文件大小最大限制，默认2M
    }
  }));
  app.use(bodyParser());
  app.use(cors());
  app.use(router.routes());
  app.use(router.allowedMethods());
  //设置静态资源的路径 设置之后 路径上不要带有 public
  const staticPath = '/public';
  app.use(static(__dirname + staticPath));
})();


app.listen(port, () => {
    console.log(`服务启动成功，端口号： ${port}`);
});
