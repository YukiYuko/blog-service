const Router = require ('koa-router');
let router = new Router();
const UserController = require('../controller/Admin');

// 登陆
router.post("/login", UserController.Login);
// 注册
router.post("/register", UserController.Reg);
// 获取用户信息_id
router.get("/userInfo", UserController.GetUserInfo);
// 获取用户信息_token
router.get("/userInfo_token", UserController.GetUserInfo_token);
// 导入管理员信息
router.get("/insertUsers", UserController.InsertUsers);

module.exports=router;
