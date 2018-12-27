const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BMP24 = require('gd-bmp').BMP24;
const createToken = require('../token/createToken');

// 验证码
let checkcodeSchema = new Schema({
  token: String,
  code: String
});

let Checkcode = mongoose.model('Checkcode', checkcodeSchema);


module.exports = {
  async checkcode(ctx, next) {
    try {
      let {code, img} = makeCapcha();
      let token = createToken(code);
      await new Checkcode({token, code}).save();
      ctx.body = {
        code: 200,
        info: '获取验证码成功！',
        data: {
          token,
          img: "data:image/bmp;base64," + img.getFileData().toString('base64')
        }
      }
    } catch (e) {
      console.log(e);
      ctx.body = {
        code: 500,
        info: '获取验证码失败！'
      }
    }
  },
  Checkcode
};



function rand(min, max) {
  return Math.random()*(max-min+1) + min | 0; //特殊的技巧，|0可以强制转换为整数
}

function makeCapcha() {
  let img = new BMP24(100, 52);
  img.drawCircle(rand(0, 100), rand(0, 52), rand(10 , 52), rand(0, 0xffffff));
  //边框
  img.drawRect(0, 0, img.w-1, img.h-1, rand(0, 0xffffff));
  img.fillRect(0, 0, 100, 52, 0x252632);
  // img.fillRect(rand(0, 100), rand(0, 52), rand(10, 35), rand(10, 35), rand(0, 0xffffff));
  img.drawLine(rand(0, 100), rand(0, 52), rand(0, 100), rand(0, 52), rand(0, 0xffffff));
  //return img;
  //画曲线
  let w=img.w/2;
  let h=img.h;
  let color = rand(0, 0xffffff);
  let y1=rand(-5,5); //Y轴位置调整
  let w2=rand(10,15); //数值越小频率越高
  let h3=rand(4,6); //数值越小幅度越大
  let bl = rand(1,5);
  for(let i=-w; i<w; i+=0.1) {
    let y = Math.floor(h/h3*Math.sin(i/w2)+h/2+y1);
    let x = Math.floor(i+w);
    for(let j=0; j<bl; j++){
      img.drawPoint(x, y+j, color);
    }
  }

  let p = "ABCDEFGHKMNPQRSTUVWXYZ3456789";
  let str = '';
  for(let i=0; i<4; i++){
    str += p.charAt(Math.random() * p.length |0);
  }

  let fonts = [BMP24.font12x24, BMP24.font16x32];
  // let fonts = [BMP24.font8x16, BMP24.font12x24, BMP24.font16x32];
  let x = 15, y=8;
  for(let i=0; i<str.length; i++){
    let f = fonts[Math.random() * fonts.length |0];
    y = 8 + rand(-5, 5);
    img.drawChar(str[i], x, y, f, rand(0xaaaaaa, 0xffffff));
    x += f.w + rand(2, 8);
  }
  return {code:str,img}
}