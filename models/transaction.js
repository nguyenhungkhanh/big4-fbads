var mongoose = require('mongoose')
var Schema = mongoose.Schema

var TransactionSchema = new Schema({
  user_id: { type: String, require: true },
  plaform: { type: String, required: true}, /*(paypal | payooner | ibanking) */
  adaccount_id: { type: String, require: true },
  amount: Number,
  confirmed: { type: Boolean, default: false },
  code: String,
  platform_transaction_id: String,
  created_time: Date,
  updated_time: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Transaction', TransactionSchema)