const mongoose = require('mongoose');
const fs = require('fs');
const glob = require('glob');
const {resolve} = require('path');
const {status} = require('../config/index')
const getId = (id) => {
  return mongoose.Types.ObjectId(id);
};
const getUserIp = (req) => {
  return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
};
// function to encode file data to base64 encoded string
function base64_encode(file) {
  // read binary data
  var bitmap = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  return new Buffer(bitmap).toString('base64');
}
// function to create file from base64 encoded string
function base64_decode(base64str, file) {
  // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
  var bitmap = new Buffer(base64str, 'base64');
  // write buffer to file
  fs.writeFileSync(file, bitmap);
  console.log('******** File created from base64 encoded string ********');
}
// 获取系统随机头像
const getUrl = (ctx) => {
  let images = glob.sync(resolve(__dirname,'../public/touxiang','*.png'));
  let round = Math.ceil(Math.random() * 39);
  let images_split = images[round].split("public");
  let url = 'http://' + ctx.headers.host + images_split[1];
  return url;
};
// 公共错误处理
const err = (ctx, e) => {
  if (e.code === 11000) {
    ctx.body = {
      code: e.code,
      info: "注册失败，已存在该数据!"
    }
  } else {
    ctx.body = {
      code: 500,
      info: "注册失败，服务器异常!"
    }
  }
};
// 公共返回
const ret = (ctx, code) => {
  ctx.status = 200;
  ctx.body = {
    code: code,
    info: status[code]
  }
};
module.exports = {
  getId,
  getUserIp,
  base64_decode,
  getUrl,
  err,
  ret
};