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
  job:{type:String},
  company:{type:String},
  introduce:{type:String},
  homePage:{type:String},
  sex:{type:Number},
  age:{type:Number},
  email:{type:String},
  password:{type:String},
  phone:{type:Number},
  qq:{type:String},
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
//导入Lib
const {getUrl} = require('../lib/index');
const {base64_decode} = require("../lib/index");
//数据库的操作

//登录

const Login = async (ctx) => {
  //拿到账号和密码
  let userName = ctx.request.body.userName;
  let password = sha1(ctx.request.body.password);//加密
  let doc = await Users.findOne({userName: userName});
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
    let user = new Users({
      userName: userName,
      password: sha1(password), //加密
      token: token,
      headImage: getUrl(ctx)
      // create_time: moment(objectIdToTimestamp(user._id)).format('YYYY-MM-DD HH:mm:ss'),//将objectid转换为用户创建时间
    });
    //将objectid转换为用户创建时间(可以不用)
    user.create_time = moment(objectIdToTimestamp(user._id)).format('YYYY-MM-DD HH:mm:ss');
    let doc = await Users.findOne({userName: user.userName});
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
  let doc = await Users.find({});
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
    let res = await Users.findOne({_id},
      {
        password: false
      }
    );
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
const DelUser = async (ctx) => {
  //拿到要删除的用户id
  let id = ctx.request.body.id;
  await Users.findOneAndRemove({_id: id});
  ctx.status = 200;
  ctx.body = {
    info: '删除成功',
    code: 200
  };
};

//修改用户信息
const UpdateUser = async (ctx) => {
  let id = ctx.request.body._id;
  let data = ctx.request.body.data;
  if (data.headImage) {
    let base64Data = data.headImage.replace(/^data:image\/\w+;base64,/, "");
    let imgName = `${Math.floor(Math.random()*10)}.${+new Date()}.jpg`;
    let imgUrl = `public/upload/${imgName}`;
    base64_decode(base64Data, imgUrl);
    data.headImage = 'http://' + ctx.headers.host + '/upload/' + imgName;
  }
  await Users.updateOne({_id: id}, data);
  ctx.status = 200;
  ctx.body = {
    info: '修改成功',
    code: 200
  };
};
//修改密码
const UpdatePassword = async (ctx) => {
  let {
    _id,
    old_password,
    new_password,
    sure_password
  } = ctx.request.body;
  let doc = await Users.findOne({_id});
  if (!doc) {
    ctx.status = 200;
    ctx.body = {
      info: status[300],
      code: 300,
    };
  } else {
    if (!old_password || !new_password || !sure_password) {
      ctx.status = 200;
      ctx.body = {
        info: "请输入完整的信息",
        code: 401,
      };
    } else {
      if (sha1(old_password) !== doc.password) {
        ctx.status = 200;
        ctx.body = {
          info: "原密码输入错误！",
          code: 401,
        };
      } else if (new_password !== sure_password) {
        ctx.status = 200;
        ctx.body = {
          info: "两次输入的密码不一致！",
          code: 401,
        };
      } else {
        doc.password = sha1(new_password);
        await doc.save();
        ctx.status = 200;
        ctx.body = {
          info: "修改成功！请重新登录",
          code: 200,
        };
      }
    }
  }
};

module.exports = {
  Login,
  Reg,
  GetAllUsers,
  DelUser,
  GetUserInfo,
  UpdateUser,
  UpdatePassword
};