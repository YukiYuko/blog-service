const {status} = require('../config/index');
const mongoose = require('mongoose');   //引入Mongoose
const Schema = mongoose.Schema;         //声明Schema
const TagsSchema = new Schema({
  newsId: {type: Schema.Types.ObjectId, ref: 'News'},
  name:{type:String},
}, { timestamps: true });
const Tags = mongoose.model('Tags', TagsSchema);

// 查询标签
const findTag = (name) => {
  return new Promise((resolve, reject) => {
    Tags.findOne({name}, (err, doc) => {
      if (err) {
        reject(err);
      }
      resolve(doc);
    });
  });
};
// 查询所有标签
const findALLTag = (name) => {
  return new Promise((resolve, reject) => {
    Tags.find({}, (err, doc) => {
      if (err) {
        reject(err);
      }
      resolve(doc);
    });
  });
};
// 创建标签
const createTag = async (ctx) => {
  let tag = new Tags({
    name: ctx.request.body.name
  });
  let doc = await findTag(tag.name);
  console.log("doc", doc)
  if (doc) {
    console.log("该标签已存在");
    ctx.status = 200;
    ctx.body = {
      code: 403000,
      info: status[403000]
    };
  } else {
    await new Promise((resolve, reject) => {
      tag.save((err) => {
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
      data: tag
    }
  }
};
// 查询所有标签
const listTag = async (ctx) => {
  let doc = await findALLTag();
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
  createTag,
  listTag
};
