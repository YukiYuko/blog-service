const Router = require ('koa-router');
let router = new Router();

const OtherController = require('../controller/Other');
// 生成验证码
router.get("/checkcode", OtherController.checkcode);


module.exports=router;
