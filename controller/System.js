const {status} = require('../config/index');
const mongoose = require('mongoose');   //引入Mongoose
const Schema = mongoose.Schema;         //声明Schema
const TagsSchema = new Schema({
  newsId: {type: Schema.Types.ObjectId, ref: 'News'},
  name:{type:String},
}, { timestamps: true });
const TypesSchema = new Schema({
  newsId: {type: Schema.Types.ObjectId, ref: 'News'},
  name:{type:String},
  key:{type:String},
}, { timestamps: true });
const Tags = mongoose.model('Tags', TagsSchema);
const Types = mongoose.model('Types', TypesSchema);

// 创建标签或类型
const createTag = async (ctx) => {
  let model = "";
  let type = ctx.request.body.type * 1 || 1;
  let doc = "";
  if (type === 1) {
    model = new Tags({
      name: ctx.request.body.name
    });
    doc = await Tags.findOne({name: model.name});
  } else if (type === 2) {
    console.log("ctx.request.body.key", ctx.request.body.key)
    model = new Types({
      name: ctx.request.body.name,
      key: ctx.request.body.key
    });
    doc = await Types.findOne({name: model.name});
  }
  if (doc) {
    ctx.status = 200;
    ctx.body = {
      code: 403000,
      info: status[403000]
    };
  } else {
    await model.save();
    ctx.status = 200;
    ctx.body = {
      code: 200,
      info: status[200],
      data: model
    }
  }
};
// 查询所有标签或类型
const listTag = async (ctx) => {
  let type = ctx.request.query.type * 1 || 1;
  let doc = "";
  if (type === 1) {
    doc = await Tags.find({});
  } else if (type === 2) {
    doc = await Types.find({});
  }
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
