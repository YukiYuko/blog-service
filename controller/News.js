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
const findNewsList = () => {
  return new Promise((resolve, reject) => {
    let pageSize = 5;                   //一页多少条
    let currentPage = 1;                //当前第几页
    // let sort = {'logindate':-1};        //排序（按登录时间倒序）
    let condition = {};                 //条件
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
  let doc = await findNewsList();
  console.log(doc)
};
module.exports = {
  FindNewsList
};