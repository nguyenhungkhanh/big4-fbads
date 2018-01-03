var mongoose = require('mongoose')
const Schema = mongoose.Schema
var bcrypt = require('bcrypt')

const UserSchema = new Schema({
  username: { type: String, require: true, unique: true },
  password: { type: String, require: true },
  email: { type: String, require: true, unique: true },
  name: { type: String, require: true },
  phone: { type: String },
  address: { type: String },
  is_active: { type: Boolean, default: true },
  role: { type: Number, required: true },
  created_time: Date,
  updated_time: Date,
  last_login: Date,
  ip_login: String
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

UserSchema.pre('save', function (next) {
  const user = this
  if (!user.isModified('password')) return next()
  return bcrypt.genSalt((saltError, salt) => {
    if (saltError) return next(saltError)
    return bcrypt.hash(user.password, salt, (hashError, hash) => {
      if (hashError) return next(hashError)
      user.password = hash;
      return next()
    })
  })
})

UserSchema.methods.comparePassword = function(password) {
  console.log(this.password)
  return bcrypt.compareSync(password, this.password)
}

module.exports = mongoose.model('User', UserSchema)