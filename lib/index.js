const mongoose = require('mongoose');
const getId = (id) => {
  return mongoose.Types.ObjectId(id);
};
const getUserIp = (req) => {
  return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
};
module.exports = {
  getId,
  getUserIp
};