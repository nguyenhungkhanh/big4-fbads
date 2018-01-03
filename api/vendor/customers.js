var express = require('express')
var router = express.Router()
var Customer = require('../../models/customer.js')

router.get('/check/:identify', (req, res) => {
  Customer.findOne({ $or: [{ username: req.params.identify }, { email: req.params.identify }, { facebook_app_id: req.params.identify }] }, (error, customer) => {
    if (error) res.status(400).json(error)
    else {
      if (customer) res.status(200).json({ exist: true })
      else res.status(200).json({ exist: false })
    }
  })
})

router.get('/search', (req, res) => {
  console.log(req.query.username)
  req.query.username = req.query.username.replace(/\'/, "")
  Customer.find({ username: {'$regex': `.*${ req.query.username }.*`} }, (error, customers) => {
    if(error) res.status(500).json(error)
    else res.status(200).json(customers)
  });
})

module.exports = router