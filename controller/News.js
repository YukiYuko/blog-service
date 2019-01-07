const mongoose = require('mongoose');  //引入Mongoose
const Schema = mongoose.Schema;         //声明Schema
const {getId, getUserIp} = require('../lib/index');

// timestamps 字段自动生成创建时间和修改时间
const NewsSchema = new Schema({
  title:{type:String},
  image:{type:String},
  newsType:{type:String},
  tags:{type:Array},
  desc:{type:String},
  content:{type:String},
  heat:{type: Number},
  isHot:{type: Boolean}
}, { timestamps: true });

const News = mongoose.model('News',NewsSchema);
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
  let pageSize = ctx.request.body.limit || 5;
  // 当前页
  let currentPage = ctx.request.body.page || 1;
  // 查询条件
  let condition = ctx.request.body.condition || {};
  // 根据什么排序
  let sort = ctx.request.body.sort || "_id";
  let skipnum = (currentPage - 1) * pageSize;   //跳过数
  let count = await News.countDocuments(condition);
  let doc = await News.aggregate([
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "newsId",
        as: "comments"
      }
    },
    {
      $match: condition
    }
  ]).sort({[sort]: -1}).skip(skipnum).limit(pageSize);
  if (doc) {
    ctx.status = 200;
    ctx.body = {
      code: 200,
      info: "请求成功",
      data: {
        total: count,
        data: doc
      }
    };
  } else {

  }
};
// 搜索
const SearchList = async (ctx) => {
  // 每页多少条
  let pageSize = ctx.request.body.limit || 5;
  // 当前页
  let currentPage = ctx.request.body.page || 1;
  // 查询条件
  let newsType = ctx.request.body.newsType || "";
  // 关键字
  let keyword = ctx.request.body.keyword || "";
  // 标签
  let tag = ctx.request.body.tag || "";
  // 根据什么排序
  let sort = ctx.request.body.sort || "_id";
  let skipnum = (currentPage - 1) * pageSize;   //跳过数
  const reg = new RegExp(keyword, 'i');
  let params = {};
  if (keyword) {
    params = {
      ...params,
      $or: [
        {'title': {'$regex': reg}},
        {'desc': {'$regex': reg}},
      ]
    }
  }
  if (newsType) {
    params = {...params, newsType}
  }
  if (tag) {
    params = {
      tags: {
        $elemMatch: {$eq: tag}
      }
    }
  }
  let count = await News.find(
    params
  ).countDocuments();
  let doc = await News.find(
    params
  ).sort({[sort]: -1}).skip(skipnum).limit(pageSize);
  if (doc) {
    ctx.status = 200;
    ctx.body = {
      code: 200,
      info: "请求成功",
      data: {
        total: count,
        data: doc
      }
    };
  } else {

  }
};
// 获取新闻
const NewsDetail = async (ctx) => {
  let id = ctx.request.body.id;
  let _id = getId(id);
  // 当前页
  let doc = await News.findOne({_id: _id});
  if (!doc.heat) {
    doc.heat = 1;
  } else {
    doc.heat++;
  }
  await doc.save();
  if (doc) {
    ctx.status = 200;
    ctx.body = {
      code: 200,
      data: doc
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
  UpdateNews,
  SearchList
};