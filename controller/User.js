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


//下面这两个包用来生成时间

const moment = require('moment');
const objectIdToTimestamp = require('objectid-to-timestamp');

//用于密码加密
const sha1 = require('sha1');
//createToken
const createToken = require('../token/createToken.js');
//数据库的操作

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
  // let password = ctx.request.body.password;
  let doc = await findUser(userName);
  if (!doc) {
    console.log('检查到用户名不存在');
    ctx.status = 200;
    ctx.body = {
      info: '检查到用户名不存在',
      success: false
    }
  } else if (doc.password === password) {
    console.log('密码一致!');
    //生成一个新的token,并存到数据库
    let token = createToken(userName);
    doc.token = token;
    await new Promise((resolve, reject) => {
      doc.save((err) => {
        if(err){
          reject(err);
        }
        resolve();
      })
    });
    ctx.status = 200;
    ctx.body = {
      success: true,
      userName,
      token, //登录成功要创建一个新的token,应该存入数据库
      create_time: doc.create_time
    };
  } else {
    console.log('密码错误!');
    ctx.status = 200;
    ctx.body = {
      success: false,
      info: "密码错误!"
    };
  }
};

//注册
const Reg = async (ctx) => {
  let user = new Users({
    userName: ctx.request.body.userName,
    password: sha1(ctx.request.body.password), //加密
    token: createToken(this.userName), //创建token并存入数据库
    // create_time: moment(objectIdToTimestamp(user._id)).format('YYYY-MM-DD HH:mm:ss'),//将objectid转换为用户创建时间
  });
  //将objectid转换为用户创建时间(可以不用)
  user.create_time = moment(objectIdToTimestamp(user._id)).format('YYYY-MM-DD HH:mm:ss');
  let doc = await findUser(user.userName);
  if (doc) {
    console.log('用户名已经存在');
    ctx.status = 200;
    ctx.body = {
      success: false
    };
  } else {
    await new Promise((resolve, reject) => {
      user.save((err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
    console.log('注册成功');
    ctx.status = 200;
    ctx.body = {
      success: true
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
  DelUser
};