var express = require('express')
var router = express.Router()
var User = require('../../models/user.js')

router.get('/check/:identify', (req, res) => {
  User.findOne({ $or: [{ username: req.params.identify }, { email: req.params.identify }]}, (error, user) => {
    if (error) res.status(400).json(error)
    else {
      if (user) res.status(200).json({ exist: true })
      else res.status(200).json({ exist: false })
    }
  })
})

router.get('/search', (req, res) => {
  req.query.username = req.query.username.replace(/\'/, "")
  User.find({ username: {'$regex': `.*${ req.query.username }.*`} }, (error, users) => {
    if(error) res.status(500).json(error)
    else res.status(200).json(users)
  });
})

module.exports = router