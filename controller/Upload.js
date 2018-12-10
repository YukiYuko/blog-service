const fs = require("fs");
const path = require("path");
const uploadSingle = async (ctx, next) => {
  /*
  * 上传单个文件
  * */
  // 获取文件
  const file = ctx.request.files.file;
  console.log(file)
  // 创建可读流
  const reader = fs.createReadStream(file.path);
  const name = new Date().getTime();
  const type = "." + file.type.split("/")[1];
  let filePath = path.join(__dirname, '../public/upload/') + `/${name + type}`;
  // 创建可写流
  const upStream = fs.createWriteStream(filePath);
  // 可读流通过管道写入可写流
  reader.pipe(upStream);
  return ctx.body = filePath;
};
module.exports = {
  uploadSingle
};