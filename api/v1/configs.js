var express = require('express')
var router = express.Router()
var Configs = require('../../models/configs')
var _ = require('lodash')

router.get('/', (req, res) => {
  Configs.find({}, (error, configs) => {
    if(error) res.status(500).json(error)
    else res.status(200).json(configs[0])
  })
})

router.get('/discounts/normal', (req, res) => {
  Configs.findOne({ 'discounts.normal': { $exists: true } }, (error, discounts) => {
    if (error) res.status(500).json(error)
    else res.status(200).json(discounts)
  })
})

router.get('/discounts/vip', (req, res) => {
  Configs.findOne({ 'discounts.vip': { $exists: true } }, (error, discounts) => {
    if (error) res.status(500).json(error)
    else res.status(200).json(discounts)
  })
})

router.post('/discounts/:type', (req, res) => {
  let { type } = req.params

  Configs.find({}, (error, configs) => {
    if (error) res.status(500).json(error)
    else {
      if (type === 'vip') {
        let discount = {
          price: `${req.body.min}-${req.body.max}`,
          value: `${req.body.value}`
        }
        configs[0].discounts.vip = JSON.stringify(discount)
        configs[0].save()
      }
      if (type === 'normal') {
        let discount = {
          price: `${req.body.min}-${req.body.max}`,
          value: `${req.body.value}`
        }
        configs[0].discounts.normal.push(discount)
        configs[0].save(error => {
          if(!error) res.status(200).json({ success: true })
          else res.status(500).json({ success: false, error })
        })
      }
    }
  })
  // Configs.findOne({ find: { $exists: true }}, (error, config) => {
  //   if(error) res.status(500).json(error)
  //   else {
  //     if(discounts) {
  //       if(req.params.type === 'vip') res.status(500).json({ success: false, error: { message: 'Đã tồn tại giá trị chiết khẩu cho khách hàng vip'}})
  //       else {
  //         let newConfig = new Configs()
  //         newDiscount.discounts.normal = {
  //           "0-10000": "5%"
  //         }
  //         newConfig.save((errorDiscount, discount) => {
  //           if(!errorDiscount) res.status(200).json(discount)
  //         })
  //       }
  //     } else {
  //       discounts.normal = {
  //         "0-10000": "5%"
  //       }
  //       discounts.save((errorDiscount, discount) => {
  //         if(!errorDiscount) res.status(200).json(discount)
  //       })
  //     }
  //   }
  // })
})
module.exports = router