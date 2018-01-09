var mongoose = require('mongoose')
const Schema = mongoose.Schema

let ConfigSchema = new Schema({
  discounts: {
    vip: Number,
    normal: Array
  }
})

module.exports = mongoose.model('Configs', ConfigSchema)