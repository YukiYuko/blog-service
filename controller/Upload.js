const fs = require("fs");
const path = require("path");
const uploadSingle = async (ctx, next) => {
  /*
  * 上传单个文件
  * */
  // 获取文件
  const file = ctx.request.files.file;
  // 创建可读流
  const reader = fs.createReadStream(file.path);
  const name = Math.random().toString();
  const type = file.name.split('.').pop();
  const newFilename = `${name}.${type}`;
  let filePath = path.join(__dirname, '../public/upload/') + `/${newFilename}`;
  // let filePath = `public/upload/${name}.${type}`;
  // 创建可写流
  const upStream = fs.createWriteStream(filePath);
  // 可读流通过管道写入可写流
  reader.pipe(upStream);
  ctx.body = {
    code: 200,
    data: { url: 'http://' + ctx.headers.host + '/upload/' + newFilename }
  }
};
module.exports = {
  uploadSingle
};