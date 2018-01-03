var mongoose = require('mongoose')
const Schema = mongoose.Schema
var bcrypt = require('bcrypt')

const CustomerSchema = new Schema({
  username: { type: String, require: true, unique: true },
  password: { type: String },
  email: { type: String, require: true, unique: true },
  name: { type: String, require: true },
  phone: { type: String },
  address: { type: String },
  is_active: { type: Boolean, default: true },
  type: { type: String, default: 'normal' },
  avatar: String,
  facebook_app_id: { type: String, required: true },
  accessToken: { type: Object },
  facebook_cover_image: { type: String },
  user_manager_id: String,
  created_time: Date,
  updated_time: { type: Date, default: Date.now },
  last_login: Date
}, {
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password
      ret.id = ret._id
      delete ret._id
      delete ret.__v
    }
  }
})

CustomerSchema.pre('save', function (next) {
  const customer = this
  if (!customer.isModified('password')) return next()
  return bcrypt.genSalt((saltError, salt) => {
    if (saltError) return next(saltError)
    return bcrypt.hash(customer.password, salt, (hashError, hash) => {
      if (hashError) return next(hashError)
      customer.password = hash;
      return next()
    })
  })
})

CustomerSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password)
}

module.exports = mongoose.model('Customer', CustomerSchema)