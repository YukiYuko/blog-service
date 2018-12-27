//$ cnpm i moment -s         //用于生成时间

//$ cnpm i objectid-to-timestamp -s //用于生成时间

//$ cnpm i sha1 -s          //安全哈希算法，用于密码加密

//user.js

const mongoose = require('mongoose');   //引入Mongoose
const Schema = mongoose.Schema;         //声明Schema

// timestamps 字段自动生成创建时间和修改时间
const UserSchema = new Schema({
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

const Users = mongoose.model('Users',UserSchema);

const {status} = require('../config/index');

//下面这两个包用来生成时间

const moment = require('moment');
const objectIdToTimestamp = require('objectid-to-timestamp');

//用于密码加密
const sha1 = require('sha1');
//createToken
const createToken = require('../token/createToken.js');
const checkToken = require('../token/checkToken.js');
//数据库的操作


//根据token获取当前登录用户信息
const findUser_token = (token) => {
  return new Promise((resolve, reject) => {
    Users.findOne({token}, (err, doc) => {
      if (err) {
        reject(err);
      }
      resolve(doc);
    });
  });
};
//根据用户名查找用户
const findUser = (userName) => {
  return new Promise((resolve, reject) => {
    Users.findOne({userName}, (err, doc) => {
      if (err) {
        reject(err);
      }
      resolve(doc);
    });
  });
};

//找到所有用户
const findAllUsers = () => {
  return new Promise((resolve, reject) => {
    Users.find({}, (err, doc) => {
      if (err) {
        reject(err);
      }
      resolve(doc);
    });
  });
};

//删除某个用户
const delUser = function (id) {
  return new Promise((resolve, reject) => {
    Users.findOneAndRemove({_id: id}, err => {
      if (err) {
        reject(err);
      }
      console.log('删除用户成功');
      resolve();
    });
  });
};
//修改某个用户
const updateUser = function (id, data) {
  // data 新的用户的值
  return new Promise((resolve, reject) => {
    Users.updateOne({_id: id}, data, err => {
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
  let password = sha1(ctx.request.body.password);//解密
  let doc = await findUser(userName);
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
      token, //登录成功要创建一个新的token,应该存入数据库
      code: 200,
      info: status[200]
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
      code_token = ""
    } = ctx.request.body;
    if (!userName || !password) {
      ctx.body = {
        info: "注册失败，请填写完整表单！",
        code: 401
      }
    }
    // 验证码判断
    let mark = await checkToken({token:code_token,code});
    if(!mark){
      ctx.body = {
        code: 401,
        info: '注册失败，验证码错误!'
      };
      return;
    }

    let token = createToken(userName);
    let user = new Users({
      userName: userName,
      password: sha1(password), //加密
      token: token
      // create_time: moment(objectIdToTimestamp(user._id)).format('YYYY-MM-DD HH:mm:ss'),//将objectid转换为用户创建时间
    });
    //将objectid转换为用户创建时间(可以不用)
    user.create_time = moment(objectIdToTimestamp(user._id)).format('YYYY-MM-DD HH:mm:ss');
    let doc = await findUser(user.userName);
    if (doc) {
      ctx.status = 200;
      ctx.body = {
        info: status[403000],
        code: 403000
      }
    } else {
      let res = await user.save();
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
const GetAllUsers = async (ctx) => {
  //查询所有用户信息
  let doc = await findAllUsers();
  ctx.status = 200;
  ctx.body = {
    succsess: '成功',
    result: doc
  };
};

//获得单个用户
const GetUser = async (ctx) => {
  let token = ctx.request.body.token;
  let userName = ctx.request.body.userName;
  let doc = await findUser(userName);
  console.log(doc)
};
//获得当前登录用户信息
const GetUser_token = async (ctx) => {
  let token = ctx.request.body.token;
  let doc = await findUser_token(token);
  console.log(doc)
  if (doc) {
    ctx.status = 200;
    ctx.body = {
      code: 200,
      info: "请求成功",
      data: doc
    };
  } else {

  }
};


//删除某个用户
const DelUser = async (ctx) => {
  //拿到要删除的用户id
  let id = ctx.request.body.id;
  await delUser(id);
  ctx.status = 200;
  ctx.body = {
    success: '删除成功'
  };
};

module.exports = {
  Login,
  Reg,
  GetAllUsers,
  DelUser,
  GetUser,
  GetUser_token
};