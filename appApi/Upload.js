const Router = require ('koa-router');
let router = new Router();
const UploadController = require('../controller/Upload');

// 登陆
router.post("/single", UploadController.uploadSingle);


module.exports=router;
