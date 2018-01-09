let express = require('express')
let router = express.Router()
let Customer = require('../../models/customer')
let Message = require('../../models/message')

router.get('/', (req, res) => {
  Message.find({}, (error, messages) => {
    if(error) res.status(500).json(error)
    else res.status(200).json(messages)
  })
})

router.post('/', (req, res) => {
  let { username, password } = req.headers

  if(username === "admin" && password === '@@Admin1234') {
    let newMessage = new Message({
      content: req.body.content,
      created_time: new Date()
    })
    newMessage.save((errorMessage, message) => {
      if(errorMessage) res.status(500).json(errorMessage)
      else res.status(200).json({ sucess: true })
    })
  } else {
    res.status(403).json({ status: 403, success: false, message: 'Wrong username and password.' })
  }
})

module.exports = router