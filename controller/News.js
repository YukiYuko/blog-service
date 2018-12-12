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
// 编辑新闻

// 删除新闻
const DeleteNews = async (ctx) => {
  let id = ctx.request.body.id;
  let _id = getId(id);
  // 当前页
  let doc = await findNews(_id);
  console.log(doc)
};

module.exports = {
  FindNewsList,
  DeleteNews
};