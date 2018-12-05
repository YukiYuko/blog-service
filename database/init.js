// mac下 需要现在cmd里面运行   sudo mongod  启动服务

const mongoose = require('mongoose');
const db = "mongodb://localhost/blog";

//glob：node的glob模块允许你使用 * 等符号，来写一个glob规则，像在shell里一样，获取匹配对应规则文件。
// resolve: 将一系列路径或路径段解析为绝对路径。
const glob = require('glob');
const {resolve} = require('path');

mongoose.Promise =  global.Promise;

// 如果要对外暴露属性或方法，就用exports就行，
// 要暴露对象(类似class，包含了很多属性和方法)，就用module.exports

exports.connect = ()=>{
  // 连接数据库
  mongoose.connect(db, { useNewUrlParser: true });

  // 设置重连次数
  let maxConnectTimes = 3;

  return new Promise((resolve, reject) => {
    //把所有连接放到这里
    mongoose.connection.on('disconnected', () => {
      console.log('************数据库断开链接 (数据库没打开就会出现这个错误)***********');
      if (maxConnectTimes < 3) {
        maxConnectTimes++;
        mongoose.connect(db);
      } else {
        reject();
        throw '数据库出现问题，程序无法搞定，请人为修理......'
      }
    });

    mongoose.connection.on('error', (err) => {
      console.log('***********数据库错误***********');
      if(maxConnectTimes<3){
        maxConnectTimes++;
        mongoose.connect(db)
      }else{
        reject(err);
        throw new Error('数据库出现问题，程序无法搞定，请人为修理......')
      }
    });

    //链接打开的时
    mongoose.connection.once('open',()=>{
      console.log('MongoDB connected successfully');
      resolve()
    })
  })
};

// exports.initSchemas = () =>{
//   // __dirname 表示当前执行脚本所在的目录。
//   // 同步获取匹配文件列表:
//   let files = glob.sync(resolve(__dirname,'./schema/','**/*.js'));
//   console.log('同步获取匹配文件列表',files);
//   // 获取之后同时引入 所有的schema文件
//   files.forEach(require)
// };
