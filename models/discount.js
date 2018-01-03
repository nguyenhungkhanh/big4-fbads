var mongoose = require('mongoose')
var Schema = mongoose.Schema

var DiscountSchema = new Schema({
  user_id: String,
  value: Number,
  type: String
})

module.exports = mongoose.model('Discount', DiscountSchema)