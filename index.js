const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const port = 3002;
let News = require('./appApi/News');
let Users = require('./appApi/Users');
let router = new Router();
//引入connect
const {connect} = require('./database/init.js')

//立即执行函数
;(async () =>{
    await connect();
    // initSchemas();
    router.use('/news',News.routes());
    router.use('/users',Users.routes());
    app.use(bodyParser());
    app.use(cors());
    app.use(router.routes());
    app.use(router.allowedMethods());
})();



app.listen(port, () => {
    console.log(`服务启动成功，端口号： ${port}`);
});
