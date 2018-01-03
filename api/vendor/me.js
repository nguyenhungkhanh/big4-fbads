var express = require('express')
var router = express.Router()
var setToken = require('../../middlewave/setToken')
var User = require('../../models/user')
var Customer = require('../../models/customer')

router.post('/', setToken, (req, res) => {
  let { decode } = req
  if (decode.role !== null) {
    User.findOne({ _id: decode.id }, (error, user) => {
      if (error) res.status(500).json(error)
      else {
        if(user) {
          if(user.comparePassword(req.body.password)) 
            res.status(200).json({ success: true, message: 'Password is correct!!!' })
          else res.status(200).json({ success: false, message: 'Mật khẩu không chính xác' })
        } else res.status(404).json({ success: false })
      }
    })
  } else {
    Customer.findOne({ _id: decode.id }, (error, customer) => {
      if (error) res.status(500).json(error)
      else {
        if(customer) {
          if(customer.comparePassword(req.body.password)) 
            res.status(200).json({ success: true, message: 'Password is correct!!!' })
          else res.status(200).json({ success: false, message: 'Mật khẩu không chính xác' })
        } else res.status(404).json({ success: false })
      }
    })
  }
})

router.get('/check/:identify', setToken, (req, res) => {
  let { decode } = req
  if (decode.role !== null) {
    User.findOne({ username: req.params.identify }, (error, user) => {
      if (error) res.status(500).json(error)
      else {
        if(user) res.status(200).json({ success: true })
        else res.status(404).json({ success: false })
      }
    })
  } else {
    Customer.findOne({ username: req.params.identify }, (error, customer) => {
      if (error) res.status(500).json(error)
      else {
        if(customer) res.status(200).json({ success: true})
        else res.status(404).json({ success: false })
      }
    })
  }
})

module.exports = router