var express = require('express')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var cors = require('cors')

var config = require('./config')

var app = express()

var apiCustomer = require('./api/v1/customers.js')
var apiVendorCustomer = require('./api/vendor/customers.js')
var apiUser = require('./api/v1/users.js')
var apiVendorUser = require('./api/vendor/users.js')
var apiMe = require('./api/v1/me.js')
var apiVendorMe = require('./api/vendor/me.js')
var apiFcebookAdAccount = require('./api/facebook/adaccounts.js')
var apiAdAccount = require('./api/v1/adaccounts')

var User = require('./models/user')

app.use(cors())
app.use(bodyParser.json())

var setToken = require('./middlewave/setToken')
function checkRole(req, res, next) {
  if(req.decode.role !== null && req.decode.role < 2) next()
  else res.status(403).json({ message: 'Bạn không có quyền truy cập api này!!!'})
}

app.use('/api/v1/customers', apiCustomer)
app.use('/api/v1/vendor/customers', apiVendorCustomer)

app.use('/api/v1/users', apiUser)
app.use('/api/v1/vendor/users', apiVendorUser)

app.use('/api/v1/me', setToken, apiMe)
app.use('/api/v1/vendor/me', apiVendorMe)
app.use('/api/v1/facebook/adaccounts', apiFcebookAdAccount )
app.use('/api/v1/adaccounts', setToken, checkRole, apiAdAccount)

app.get('/', (req, res) => {
  res.sendFile(__dirname + 'public/index.html')
})

app.listen(config.port, () => {
  mongoose.Promise = global.Promise
  mongoose.connect( config.database, { useMongoClient: true })
    .then(() => {
      console.log('Server is running on port', config.port)
      // check and init superadmin 
      User.findOne({ username: "superadmin" }, (error, user) => {
        if (!error && !user) {
          let newUser = new User({
            username: 'superadmin',
            password: '123qaz',
            email: 'nhk020996@gmail.com',
            name: 'Super Admin',
            role: 0,
            created_time: new Date()
          })
          var promise = newUser.save();
          promise.then(function (newUser) {
            console.log(newUser)
          });
        }
      })
    })
    .catch((error) => console.log(error))
})