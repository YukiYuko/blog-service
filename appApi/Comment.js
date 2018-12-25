const Router = require ('koa-router');
let router = new Router();

const CommentController = require('../controller/Comment');
const prefix = "/comment";
// 发表留言
router.post("/create", CommentController.createComment);
// 所有标签
router.post("/list", CommentController.listComment);


module.exports=router;
