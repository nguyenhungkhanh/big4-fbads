var mongoose = require('mongoose')
const Schema = mongoose.Schema

const TokenSchema = new Schema({
  user: { type: String, ref: 'User' },
  type: String,
  value: String,
  expire: Date,
  verify: String
})

module.exports = mongoose.model('Token', TokenSchema)