const Router = require ('koa-router');
let router = new Router();

const CommentController = require('../controller/Comment');
const prefix = "/comment";
// 发表留言
router.post("/create", CommentController.createComment);
// 所有留言
router.post("/list", CommentController.listComment);
// 修改留言
router.post("/update", CommentController.UpdateComment);


module.exports=router;
