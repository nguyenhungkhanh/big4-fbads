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
  let { client_id, client_secret } = req.headers
  
  if( client_id === 'client_id' && client_secret === 'client_secret') {
    let newMessage = new Message({
      content: req.body.content,
      created_time: new Date()
    })
    newMessage.save((errorMessage, message) => {
      if(errorMessage) res.status(500).json(errorMessage)
      else res.status(200).json({ sucess: true })
    })
  } else {
    res.status(403).json({ status: 403, message: 'Wrong client_id and client_secret.' })
  }
})

module.exports = router