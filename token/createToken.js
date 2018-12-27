const jwt = require('jsonwebtoken');
const {TOKEN_ENCODE_STR} = require('../config/index');

/*
* 调用 jsonwebtoken 的 sign() 方法来生成token，接收三个参数，
* 第一个是载荷，用于编码后存储在 token 中的数据，也是验证 token 后可以拿到的数据；
* 第二个是密钥，自己定义的，验证的时候也是要相同的密钥才能解码；
* 第三个是options，可以设置 token 的过期时间。
* */
module.exports = (user_id) => {
  return jwt.sign({user_id: user_id}, TOKEN_ENCODE_STR, {expiresIn: '1h'});
};