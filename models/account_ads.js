var mongoose = require('mongoose')
var Schema = mongoose.Schema

var AccountAdsSchema = new Schema({
  name: { type: String, require: true },
  accessToken: { type: String, require: true },
  expired_time: Date,
  created_time: Date,
  updated_time: Date
})

module.exports = mongoose.model('AccountAds', AccountAdsSchema)