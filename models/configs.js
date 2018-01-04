var mongoose = require('mongoose')
const Schema = mongoose.Schema

let ConfigSchema = new Schema({
  discounts: {
    vip: String,
    normal: String
  }
})

module.exports = mongoose.model('Configs', ConfigSchema)