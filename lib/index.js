const mongoose = require('mongoose');
const getId = (id) => {
  return mongoose.Types.ObjectId(id);
};
module.exports = {
  getId
};