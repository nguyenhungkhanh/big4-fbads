var express = require('express')
var router = express.Router()
var User = require('../../models/user')
var Customer = require('../../models/customer')
var Token = require('../../models/token')
var setToken = require('../../middlewave/setToken')

router.get('/', (req, res) => {
  let { decode } = req
  if (decode.role !== null) {
    User.findById(decode.id, (error, user) => {
      if (error) res.status(500).json(error)
      else {
        if(user) res.status(200).json(user)
        else res.status(404).json({ success: false })
      }
    })
  } else {
    Customer.findById(decode.id, (error, customer) => {
      if (error) res.status(500).json(error)
      else res.status(200).json(customer)
    })
  }
})

router.put('/', (req, res) => {
  let { decode } = req
  if (decode.role !== null) {
    User.findOne({ _id: decode.id }, (error, user) => {
      user.password = req.body.newPassword || user.password
      user.name = req.body.name || user.name
      user.phone = req.body.phone || user.phone
      user.address = req.body.address || user.address
      user.updated_time = new Date()
      user.username = req.body.username || user.username
      if(req.body.newPassword) user.password = req.body.newPassword
      user.save((error, newUser) => {
        if (error) res.status(500).json(error)
        else res.status(200).json(newUser)
      })
    })
  } else {
    Customer.findOne({ _id: decode.id }, (error, customer) => {
      customer.password = req.body.newPassword || customer.password
      customer.name = req.body.name || customer.name
      customer.phone = req.body.phone || customer.phone
      customer.address = req.body.address || customer.address
      customer.updated_time = new Date()
      customer.username = req.body.username || customer.username

      customer.save((error, newCustomer) => {
        if (error) res.status(500).json(error)
        else res.status(200).json(newCustomer)
      })
    })
  }
})

router.delete('/', (req, res) => {
  let { decode } = req
  
  Token.remove({ 'user': decode.id }, error => {
    if (error) res.status(500).json(error)
    else res.status(200).json({ success: true })
  })
})

module.exports = router