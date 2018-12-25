const fs = require('fs');
const path = require('path');
const glob = require('glob');
const {resolve} = require('path');
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
  userId:{type:String},
  replyId:{type: String},
  headImage:{type:String}
}, { timestamps: true });
const GuestSchema = new Schema({
  name:{type:String},
  url:{type:String},
  mail:{type:String},
  qq:{type:Number},
  headImage:{type:String},
}, { timestamps: true });

const Comments = mongoose.model('Comments', CommentsSchema);
const Guests = mongoose.model('Guest',GuestSchema);


// 查询当前文章下的留言
const findALLComment = (newsId) => {
  return new Promise((resolve, reject) => {
    Comments.find({newsId}).sort({'_id': -1}).exec((err, doc) => {
      if (err) {
        reject(err);
      }
      resolve(doc);
    })
  });
};
// 查询该昵称是否已被占用
const findGuest = (name) => {
  return new Promise((resolve, reject) => {
    Guests.findOne({name}, (err, doc) => {
      if (err) {
        reject(err)
      }
      resolve(doc);
    })
  })
};
// 发表留言
const createComment = async (ctx) => {
  let images = glob.sync(resolve(__dirname,'../public/touxiang','*.png'));
  let round = Math.ceil(Math.random() * 39);
  let images_split = images[round].split("public");
  let url = 'http://' + ctx.headers.host + images_split[1];

  let Comment = new Comments({
    name: ctx.request.body.name,
    desc: ctx.request.body.desc,
    mail: ctx.request.body.mail,
    qq: ctx.request.body.qq,
    url: ctx.request.body.url,
    newsId: ctx.request.body.newsId,
    userId: ctx.request.body.userId,
    replyId: ctx.request.body.replyId,
    headImage: url
  });
  try {
    await new Promise((resolve, reject) => {
      Comment.save((err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
    ctx.status = 200;
    ctx.body = {
      code: 200,
      info: status[200],
      data: Comment
    }
  } catch (e) {
    console.log("e",e)
  }
};
// 查询当前文章下的留言
const listComment = async (ctx) => {
  let newsId = ctx.request.body.newsId;
  let doc = await findALLComment(newsId);
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
