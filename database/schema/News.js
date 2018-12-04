const mongoose = require('mongoose')    //引入Mongoose
const Schema = mongoose.Schema          //声明Schema

const NewsSchema = new Schema({
  // id:{unique:true,type:String},
  title:{type:String},
  image:{type:String},
  type:{type:Number},
  comments:{type:Number},
  tags:{type:Array}
})

mongoose.model('News',NewsSchema)
