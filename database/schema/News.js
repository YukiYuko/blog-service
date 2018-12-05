const mongoose = require('mongoose')    //引入Mongoose
const Schema = mongoose.Schema          //声明Schema

// timestamps 字段自动生成创建时间和修改时间
const NewsSchema = new Schema({
  // id:{unique:true,type:String},
  title:{type:String},
  image:{type:String},
  type:{type:Number},
  comments:{type:Number},
  tags:{type:Array},
  content:{type:String},
}, { timestamps: true });

mongoose.model('News',NewsSchema)
