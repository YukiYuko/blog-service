const {status} = require('../config/index');
const mongoose = require('mongoose');   //引入Mongoose
const Schema = mongoose.Schema;         //声明Schema
const CommentsSchema = new Schema({
  name:{type:String},
  url:{type:String},
  desc:{type:String},
  mail:{type:String},
  qq:{type:Number},
  newsId:{type:String},
  userId:{type:String}
}, { timestamps: true });
const Comments = mongoose.model('Comments', CommentsSchema);

// 查询标签
const findComment = (name) => {
  return new Promise((resolve, reject) => {
    Comments.findOne({name}, (err, doc) => {
      if (err) {
        reject(err);
      }
      resolve(doc);
    });
  });
};
// 查询所有标签
const findALLComment = (name) => {
  return new Promise((resolve, reject) => {
    Comments.find({}, (err, doc) => {
      if (err) {
        reject(err);
      }
      resolve(doc);
    });
  });
};
// 发表留言
const createComment = async (ctx) => {
  let Comment = new Comments({
    name: ctx.request.body.name,
    desc: ctx.request.body.desc,
    mail: ctx.request.body.mail,
    qq: ctx.request.body.qq,
    url: ctx.request.body.url,
    newsId: ctx.request.body.newsId,
    userId: ctx.request.body.userId
  });
  await new Promise((resolve, reject) => {
    Comment.save((err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
  console.log('添加成功');
  ctx.status = 200;
  ctx.body = {
    code: 200,
    info: status[200],
    data: Comment
  }
};
// 查询所有标签
const listComment = async (ctx) => {
  let doc = await findALLComment();
  if (doc) {
    ctx.status = 200;
    ctx.body = {
      code: 200,
      info: "请求成功",
      data: doc
    };
  } else {
    ctx.status = 200;
    ctx.body = {
      code: 300,
      info: status[300]
    };
  }
};

module.exports = {
  createComment,
  listComment
};
