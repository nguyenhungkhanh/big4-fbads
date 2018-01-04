var express = require('express')
var Discount = require('../../models/discount')

var router = express.Router()

router.get('/', (req, res) => {
  Discount.find({}, (error, discounts) => {
    if(error) res.status(500).json(error) 
    else res.status(200).json(discounts)
  })
})

router.post('/', (req, res) => {
  let newDiscount = new Discount(req.body)

  newDiscount.save((error, discount) => {
    if(error) res.status(500).json({ success: false, error })
    else res.status(200).json({ success: true })
  })
})

router.put('/:idDiscount', (req, res) => {
  Discount.findById(req.params.idDiscount, (error, discount) => {
    discount.min = req.body.min || discount.min
    discount.max = req.body.max || discount.max
    discount.value = req.body.value || discount.value

    discount.save((error, discount) => {
      if(error) res.status(500).json({ status: 500, success: false, error })
      else res.status(200).json({ status: 200, success: true, discount })
    })
  })
})

router.delete('/:idDiscount', (req, res) => {
  Discount.findById(req.params.idDiscount)
          .remove((error, discount) => {
            if(error) res.status(500).json({ status: 500, success: false, error })
            else res.status(200).json({ status: 200, success: true, discount })
          })
})

module.exports = router