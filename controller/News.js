const mongoose = require('mongoose');  //引入Mongoose
const Schema = mongoose.Schema;         //声明Schema
const {getId} = require('../lib/index');

// timestamps 字段自动生成创建时间和修改时间
const NewsSchema = new Schema({
  // id:{unique:true,type:String},
  title:{type:String},
  image:{type:String},
  type:{type:Number},
  comments:{type:Number},
  tags:{type:Array},
  content:{type:String},
}, { timestamps: true });

const News = mongoose.model('News',NewsSchema);

// 获取新闻列表
const findNewsList = ({pageSize, currentPage, condition}) => {
  return new Promise((resolve, reject) => {
    // let sort = {'logindate':-1};        //排序（按登录时间倒序）
    let skipnum = (currentPage - 1) * pageSize;   //跳过数
    News.find(condition).skip(skipnum).limit(pageSize).exec((err, doc) => {
      if (err){
        reject(err)
      } else {
        resolve(doc);
      }
    })
  });
};
// 查找单个新闻
const findNews = (id) => {
  return new Promise((resolve, reject) => {
    News.find({_id: id}).exec((err, doc) => {
      if (err){
        reject(err)
      } else {
        resolve(doc);
      }
    })
  })
};
// 更新单个新闻
const updateNews = (id, data) => {
  return new Promise((resolve, reject) => {
    News.findOneAndUpdate({_id: id}, data, (err,doc) => {
      if (err){
        reject(err)
      } else {
        resolve(doc);
      }
    })
  })
};
// 删除单个新闻
const deleteNews = (id) => {
  return new Promise((resolve, reject) => {
    News.findOneAndDelete({_id: id}, (err,doc) => {
      if (err){
        reject(err)
      } else {
        resolve(doc);
      }
    })
  })
};


// 获取新闻列表
const FindNewsList = async (ctx) => {
  // 每页多少条
  let pageSize = ctx.request.body.limit || 10;
  // 当前页
  let currentPage = ctx.request.body.page || 1;
  // 查询条件
  let condition = ctx.request.body.condition || {};
  let data = {
    pageSize,
    currentPage,
    condition
  };
  let doc = await findNewsList(data);
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
// 获取新闻
const NewsDetail = async (ctx) => {
  let id = ctx.request.body.id;
  let _id = getId(id);
  // 当前页
  let doc = await findNews(_id);
  if (doc) {
    ctx.status = 200;
    ctx.body = {
      code: 200,
      data: doc[0]
    };
  } else {

  }
};
// 更新新闻
const UpdateNews = async (ctx) => {
  let id = ctx.request.body.id;
  let _id = getId(id);
  let data = ctx.request.body.data;
  // 当前页
  let doc = await updateNews(_id, data);
  if (doc) {
    ctx.status = 200;
    ctx.body = {
      code: 200,
      info: "更新成功"
    };
  } else {

  }
};

// 删除新闻
const DeleteNews = async (ctx) => {
  let id = ctx.request.body.id;
  let _id = getId(id);
  // 当前页
  let doc = await deleteNews(_id);
  if (doc) {
    ctx.status = 200;
    ctx.body = {
      code: 200,
      info: "删除成功"
    };
  } else {

  }
};

module.exports = {
  FindNewsList,
  DeleteNews,
  NewsDetail,
  UpdateNews
};