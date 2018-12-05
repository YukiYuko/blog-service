const Router = require ('koa-router');
const path = require('path');
let router = new Router();

const mongoose = require('mongoose');
const fs = require('fs');
const UserController = require('../controller/User');

//获取所有数据
router.get('/insertUsers',async(ctx)=>{

  fs.readFile(path.resolve(__dirname, '../data_json/users.json'),'utf8',(err,data)=>{
    let _data=JSON.parse(data);
    let saveCount=0;
    const Users = mongoose.model('Users');
    _data.map((value,index)=>{
      console.log(value);
      let newUsers= new Users(value);
        newUsers.save().then(()=>{
        saveCount++;
        console.log('成功'+saveCount)
      }).catch(error=>{
        console.log('失败：'+error)
      })
    })

  });
  ctx.body="开始导入数据"

});


// 登陆
router.post("/login", UserController.Login);

module.exports=router;
