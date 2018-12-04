const Router = require ('koa-router');
const path = require('path');
let router = new Router();

const mongoose = require('mongoose');
const fs = require('fs');


//获取所有数据
router.get('/insertNews',async(ctx)=>{

  fs.readFile(path.resolve(__dirname, '../data_json/news.json'),'utf8',(err,data)=>{
    let _data=JSON.parse(data);
    console.log(_data)
    let saveCount=0;
    const News = mongoose.model('News');
    _data.map((value,index)=>{
      console.log(value);
      let newNews = new News(value);
        newNews.save().then(()=>{
        saveCount++;
        console.log('成功'+saveCount)
      }).catch(error=>{
        console.log('失败：'+error)
      })
    })

  });
  ctx.body="开始导入数据"

});
// 获取新闻列表
router.get('/newsList', async (ctx) => {
  let page = ctx.query.page || 1;
  let limit = ctx.query.limit || 10;
  console.log(ctx.query)
  const News = mongoose.model('News');
  await News.find().exec()
    .then(async(result)=>{
      ctx.body={code:200,message:'成功', data: result}
    })
    .catch(error=>{
      console.log(error);
      ctx.body={code:500,message:'失败', data: error}
    });
});
// 新建新闻
router.post('/createNews', async (ctx) => {
  let data = ctx.request.body;
  const News = mongoose.model('News');
  await new News(data).save().then((result) => {
    ctx.body={code:200,message:'成功', data: result}
    console.log("result",result)
  }).catch((error) => {
    ctx.body={code:500,message:'失败', data: error}
    console.log("error", error)
  })
});
module.exports=router;
