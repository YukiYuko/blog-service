const glob = require('glob');
const {resolve} = require('path');
const {getId} = require('../lib/index');
const {status} = require('../config/index');
const mongoose = require('mongoose');   //引入Mongoose
const Schema = mongoose.Schema;         //声明Schema
const CommentsSchema = new Schema({
  name:{type:String},
  url:{type:String},
  desc:{type:String},
  mail:{type:String},
  qq:{type:Number},
  newsId:{type: Schema.Types.ObjectId},
  userId:{type:String},
  reply:{type: Array},
  headImage:{type:String},
  pid:{type: String},
  hasChildren:{type: Boolean},
  answer:{type: Object},
  floor:{type: Number}
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

const findALLComment = async ({pageSize, currentPage, condition}) => {
  let skipNum = (currentPage - 1) * pageSize;   //跳过数
  let count = await Comments.countDocuments(condition);
  let doc = await Comments.find(condition).skip(skipNum).limit(pageSize).sort({'_id': -1});
  let taskList=[];
  return new Promise((resolve,reject) => {
    doc.forEach((item) => {
      let task=new Promise((resolve,reject)=>{
        let pid = item._id;
        Comments.find({'pid': pid}).exec((_err, _doc) => {
          if (_err) {
            reject(_err)
          }else {
            item.reply = _doc;
            resolve(item);
          }
        });
      });
      taskList.push(task);
    });
    Promise.all(taskList).then(()=>{
      resolve({
        data: doc,
        total: count
      });
    })
  })
};

// 查询评论
const findComment = (id) => {
  return new Promise((resolve, reject) => {
    Comments.findOne({_id: id}, (err,doc) => {
      if (err){
        reject(err)
      } else {
        resolve(doc);
      }
    })
  })
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
const getUrl = (ctx) => {
  let images = glob.sync(resolve(__dirname,'../public/touxiang','*.png'));
  let round = Math.ceil(Math.random() * 39);
  let images_split = images[round].split("public");
  let url = 'http://' + ctx.headers.host + images_split[1];
  return url;
};
// 发表留言
const createComment = async (ctx) => {
  let lastComment = await Comments.find({
    newsId: ctx.request.body.newsId,
    pid: "0"
  }).sort({'_id': -1}).limit(1);
  let lastfloor = lastComment.length ? lastComment[0].floor + 1 : 1;
  let data = {
    name: ctx.request.body.name,
    desc: ctx.request.body.desc,
    mail: ctx.request.body.mail,
    qq: ctx.request.body.qq,
    url: ctx.request.body.url,
    newsId: getId(ctx.request.body.newsId),
    userId: ctx.request.body.userId,
    reply: ctx.request.body.reply,
    headImage: getUrl(ctx),
    pid: ctx.request.body.pid || 0,
    answer: ctx.request.body.answer
  };
  // 只有父评论才有楼层
  if (!ctx.request.body.pid) {
    data = {...data, floor: lastfloor}
  }
  let Comment = new Comments(data);
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
// 更新评论
const UpdateComment = async (ctx) => {
  let id = ctx.request.body.id;
  let _id = getId(id);
  let Comment = new Comments({
    name: ctx.request.body.name,
    desc: ctx.request.body.desc,
    mail: ctx.request.body.mail,
    qq: ctx.request.body.qq,
    url: ctx.request.body.url,
    newsId: ctx.request.body.newsId,
    userId: ctx.request.body.userId,
    reply: ctx.request.body.reply,
    headImage: getUrl(ctx)
  });
  // 当前页
  let doc = await findComment(_id);
  if (!doc) {
    ctx.status = 200;
    ctx.body = {
      info: status[300],
      code: 300
    }
  } else {
    doc.reply.push(Comment);
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
      code: 200,
      info: status[200],
      data: Comment
    };
  }
};
// 查询当前文章下的留言
const listComment = async (ctx) => {
  let newsId = getId(ctx.request.body.newsId);
  // 每页多少条
  let pageSize = ctx.request.body.limit || 5;
  // 当前页
  let currentPage = ctx.request.body.page || 1;
  // 查询条件
  let condition = ctx.request.body.condition || {};
  let data = {
    pageSize,
    currentPage,
    condition:{
      newsId,
      pid: "0"
    }
  };
  let doc = await findALLComment(data);
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
  listComment,
  UpdateComment
};
