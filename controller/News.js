const mongoose = require('mongoose');  //引入Mongoose
const Schema = mongoose.Schema;         //声明Schema

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
module.exports = {
  FindNewsList
};