const status = {
  200: "成功",
  300: "查询失败",
  401: "参数错误",
  500: "服务器错误",
  403000: "已存在该数据",
  403001: "用户名或者密码错误",
  403002: "用户名或者密码错误",
};
module.exports = {
  status,
  // 用户密码加密字符串
  PWD_ENCODE_STR: "yuki_user_encode_str",
  // token 加密字符串,
  TOKEN_ENCODE_STR: "yuki_token_encode_str",
};
