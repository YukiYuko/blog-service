//$ cnpm i moment -s         //用于生成时间

//$ cnpm i objectid-to-timestamp -s //用于生成时间

//$ cnpm i sha1 -s          //安全哈希算法，用于密码加密

//user.js

const mongoose = require('mongoose');   //引入Mongoose
const Schema = mongoose.Schema;         //声明Schema

// timestamps 字段自动生成创建时间和修改时间
const AdminSchema = new Schema({
  userName:{type:String},
  nickname:{type:String},
  headImage:{type:String},
  sex:{type:Number},
  age:{type:Number},
  email:{type:String},
  password:{type:String},
  phone:{type:Number},
  token:{type:String},
  create_time: Date
}, { timestamps: true });
const fs = require("fs");
const path = require('path');

const Admins = mongoose.model('Admin',AdminSchema);

const {status} = require('../config/index');

//下面这两个包用来生成时间

const moment = require('moment');
const objectIdToTimestamp = require('objectid-to-timestamp');

//用于密码加密
const sha1 = require('sha1');
//createToken
const createToken = require('../token/createToken.js');
const checkToken = require('../token/checkToken.js');



const InsertUsers = async (ctx) => {
  fs.readFile(path.resolve(__dirname, '../data_json/users.json'),'utf8',(err,data)=>{
    let _data=JSON.parse(data);
    let saveCount=0;
    _data.map((value,index)=>{
      console.log(value);
      let newUsers= new Admins(value);
      newUsers.save().then(()=>{
        saveCount++;
        console.log('成功'+saveCount)
      }).catch(error=>{
        console.log('失败：'+error)
      })
    })

  });
  ctx.body="开始导入数据"
};

//数据库的操作

//根据用户名查找用户
const findAdmin = (userName) => {
  return new Promise((resolve, reject) => {
    Admins.findOne({userName}, (err, doc) => {
      if (err) {
        reject(err);
      }
      resolve(doc);
    });
  });
};

//找到所有用户
const findAllAdmins = () => {
  return new Promise((resolve, reject) => {
    Admins.find({}, (err, doc) => {
      if (err) {
        reject(err);
      }
      resolve(doc);
    });
  });
};

//删除某个用户
const delAdmin = function (id) {
  return new Promise((resolve, reject) => {
    Admins.findOneAndRemove({_id: id}, err => {
      if (err) {
        reject(err);
      }
      console.log('删除用户成功');
      resolve();
    });
  });
};
//修改某个用户
const updateAdmin = function (id, data) {
  // data 新的用户的值
  return new Promise((resolve, reject) => {
    Admins.updateOne({_id: id}, data, err => {
      if (err) {
        reject(err);
      }
      console.log('更新用户成功');
      resolve();
    })
  })
};

//登录

const Login = async (ctx) => {
  //拿到账号和密码
  let userName = ctx.request.body.userName;
  // let password = sha1(ctx.request.body.password);//解密
  let password = ctx.request.body.password;//解密
  let doc = await findAdmin(userName);
  if (!doc) {
    console.log('检查到用户名不存在');
    ctx.status = 200;
    ctx.body = {
      info: status[403001],
      code: 403001
    }
  } else if (doc.password === password) {
    console.log('密码一致!');
    //生成一个新的token,并存到数据库
    let token = createToken(doc._id);
    doc.token = token;
    await doc.save();
    ctx.status = 200;
    ctx.body = {
      code: 200,
      info: status[200],
      data: {
        _id: doc._id,
        token
      }
    };
  } else {
    console.log('密码错误!');
    ctx.status = 200;
    ctx.body = {
      info: status[403002],
      code: 403002
    };
  }
};

//注册
const Reg = async (ctx) => {
  try {
    let {
      userName = "",
      password = "",
      code = "",
    } = ctx.request.body;
    if (!userName || !password) {
      ctx.body = {
        info: "注册失败，请填写完整表单！",
        code: 401
      }
    }
    console.log("ctx.session.code", ctx.session.code);
    // 验证码判断
    if (code.toUpperCase() !== ctx.session.code) {
      ctx.body = {
        code: 401,
        info: '注册失败，验证码错误!'
      };
      return;
    }

    let token = createToken(userName);
    let admin = new Admins({
      userName: userName,
      password: sha1(password), //加密
      token: token
      // create_time: moment(objectIdToTimestamp(user._id)).format('YYYY-MM-DD HH:mm:ss'),//将objectid转换为用户创建时间
    });
    //将objectid转换为用户创建时间(可以不用)
    admin.create_time = moment(objectIdToTimestamp(admin._id)).format('YYYY-MM-DD HH:mm:ss');
    let doc = await findUser(admin.userName);
    if (doc) {
      ctx.status = 200;
      ctx.body = {
        info: status[403000],
        code: 403000
      }
    } else {
      let res = await admin.save();
      if (res._id != null) {
        console.log('注册成功');
        ctx.body = {
          info: status[200],
          code: 200,
          data: {
            _id: res._id,
            userName,
            token,
          }
        }
      } else {
        ctx.body = {
          code: 500,
          info: "注册失败，服务器异常!"
        }
      }
    }
  } catch (e) {
    ctx.body = {
      code: 500,
      info: "注册失败，服务器异常!"
    }
  }
};

//获得所有用户信息
const GetAllAdmins = async (ctx) => {
  //查询所有用户信息
  let doc = await findAllAdmins();
  ctx.status = 200;
  ctx.body = {
    succsess: '成功',
    result: doc
  };
};

//通过_id 获取用户信息
const GetUserInfo =  async (ctx, next) => {
  let _id = ctx.query._id;
  if(_id.length !== 24){
    ctx.body = {
      code: 401,
      info: '查询失败，_id错误！'
    };
    return;
  }
  try {
    let res = await Admins.findOne({_id},{userName:true,_id: true});
    ctx.body = {
      code: 200,
      info: '查询成功！',
      data: res
    }
  }catch(e){
    console.log(e);
    ctx.body = {
      code: 500,
      info: '查询失败，服务器异常，请稍后再试!'
    }
  }
};
//通过token 获取用户信息
const GetUserInfo_token =  async (ctx, next) => {
  let token = ctx.query.token;
  try {
    let res = await Admins.findOne({token});
    ctx.body = {
      code: 200,
      info: '查询成功！',
      data: res
    }
  }catch(e){
    console.log(e);
    ctx.body = {
      code: 500,
      info: '查询失败，服务器异常，请稍后再试!'
    }
  }
};

//删除某个用户
const DelAdmin = async (ctx) => {
  //拿到要删除的用户id
  let id = ctx.request.body.id;
  await delAdmin(id);
  ctx.status = 200;
  ctx.body = {
    success: '删除成功'
  };
};

module.exports = {
  InsertUsers,
  Login,
  Reg,
  GetAllAdmins,
  DelAdmin,
  GetUserInfo,
  GetUserInfo_token
};