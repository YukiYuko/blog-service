const mongoose = require('mongoose');   //引入Mongoose
const Schema = mongoose.Schema;         //声明Schema

// timestamps 字段自动生成创建时间和修改时间
const UserSchema = new Schema({
  name:{type:String},
  nickname:{type:String},
  headImage:{type:String},
  sex:{type:Number},
  age:{type:Number},
  email:{type:String},
  password:{type:String},
  phone:{type:Number},
}, { timestamps: true });

mongoose.model('Users',UserSchema);
