var mongoose = require('mongoose')
var Schema = mongoose.Schema

var LogSchema = new Schema({
  type: Number,
  user_id: String,
  item_id: String,
  item_name: String,
  value_old: String,
  value_new: String,
  updated_time: { type: Date, default: Date.now },
  updated_ip: String
})

module.exports = mongoose.model('Log', LogSchema)