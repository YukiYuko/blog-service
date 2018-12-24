const Router = require ('koa-router');
let router = new Router();

const SystemController = require('../controller/System');
const prefix = "/tag";
// 创建标签
router.post(prefix +"/create", SystemController.createTag);
// 所有标签
router.get(prefix +"/list", SystemController.listTag);


module.exports=router;
