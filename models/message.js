var mongoose = require('mongoose')
const Schema = mongoose.Schema

const MessageSchema = new Schema({
  transaction_id: { type: String, ref: 'Transaction'},
  content: { type: String, required: true },
  from_number: Number,
  created_time: Date
}, {
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
      }
    }
  })

module.exports = mongoose.model('Message', MessageSchema)