const Router = require ('koa-router');
const path = require('path');
let router = new Router();

const mongoose = require('mongoose');
const fs = require('fs');
const NewsController = require('../controller/News');
const {base64_decode} = require("../lib/index")


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
router.post('/newsList', NewsController.FindNewsList);
// 删除新闻
router.post('/newsDelete', NewsController.DeleteNews);
// 获取单个新闻
router.post('/newsDetail', NewsController.NewsDetail);
// 更新新闻
router.post('/newsUpdate', NewsController.UpdateNews);
// 搜索
router.post('/search', NewsController.SearchList);
// 喜欢
router.post('/like', NewsController.LikeNews);
// 喜欢列表
router.get('/likeList', NewsController.likeNewsList);
// 新建新闻
router.post('/createNews', async (ctx) => {
  let data = ctx.request.body;
  let base64Data = data.image.replace(/^data:image\/\w+;base64,/, "");
  let imgName = `${Math.floor(Math.random()*10)}.${+new Date()}.jpg`;
  let imgUrl = `public/upload/${imgName}`;
  base64_decode(base64Data, imgUrl);

  data.image = 'http://' + ctx.headers.host + '/upload/' + imgName;

  const News = mongoose.model('News');
  await new News(data).save().then((result) => {
    ctx.body={code:200,info:'成功', data: result};
    console.log("result",result)
  }).catch((error) => {
    ctx.body={code:500,info:'失败', data: error};
    console.log("error", error)
  })
});

module.exports=router;
