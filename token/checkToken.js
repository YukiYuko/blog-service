const jwt = require('jsonwebtoken');
const {TOKEN_ENCODE_STR} = require('../config/index');
const {Checkcode} = require('../controller/Other');

module.exports = async ({token, code}) => {
  //拿到token
  try {
    // 验证码转大写
    code = code.toUpperCase();
    await jwt.verify(token, TOKEN_ENCODE_STR);
    // 读数据库，删除验证码
    let res = await Checkcode.findOneAndDelete({token,code});
    if(res == null){
      return false;
    }
  }catch (e) {
    return false;
  }
  return true;
};