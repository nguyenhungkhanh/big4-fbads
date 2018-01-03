var express = require('express')
var router = express.Router()
const request = require('request');
var axios = require('axios')
var config = require('../../config')
var AdAccount = require('../../models/account_ads')
var setToken = require('../../middlewave/setToken')
var Customer = require('../../models/customer')

let { versionGraphFacebook } = config

router.get('/', setToken, (req, res) => {
  let { decode } = req
  Customer.findById(decode.id, (error, customer) => {
    if (error) res.status(500).json(error)
    else {
      if (!customer) res.status(404).json(customer)
      else {
        axios.get(`${versionGraphFacebook}/me/adaccounts?fields=account_id,account_status,currency,created_time,name&access_token=${customer.accessToken.value}`)
          .then(response => {
            if (response.status === 200) {
              res.status(200).json(response.data.data)
            } else {
              res.status(500).json({ success: false })
            }
          }, error => {
            res.status(500).json(error.response.data)
          }).catch(error => res.status(500).json(error.response.data))
      }
    }
  })
})

router.post('/checkToken/business', (req, res) => {
  console.log(`${versionGraphFacebook}/me/businesses?access_token=${req.body.accessToken}`)
  axios.get(`${versionGraphFacebook}/me/businesses?access_token=${req.body.accessToken}`)
    .then(response => {
      res.status(200).json(response.data)
    }, error => res.status(500).json(error.response.data))
    .catch(error => res.status(500).json(error.response.data))
})

router.get('/business/:businessId', (req, res) => {
  new Promise((resolve, reject) => {
    AdAccount.findById(req.params.businessId, (error, adaccount) => {
      if (error) res.status(500).json(error)
      else {
        if (!adaccount) {
          res.status(404).json(adaccount)
          console.log('rong')
        }
        else resolve(adaccount.accessToken)
      }
    })
  }).then(accessToken => {
    axios.get(`${versionGraphFacebook}/me/businesses?access_token=${accessToken}`)
      .then(response => {
        let adId = response.data.data
        if (adId.length > 0) {
          let dataFinal = []
          console.log('adId', adId)
          for (let i = 0; i < adId.length; i++) {
            axios.get(`${versionGraphFacebook}/${adId[i].id}/adaccounts?fields=id,account_id,account_status,currency,created_time,name&access_token=${accessToken}`)
              .then(responseAd => {
                dataFinal.push(responseAd.data.data)
                console.log(dataFinal)
                if (i === adId.length - 1) returnData(...dataFinal)
              }, error => {
                res.status(500).json(error.response.data)
              }).catch(error => res.status(500).json(error.response.data))
          }
          function returnData(data) {
            console.log(data)
            res.status(200).json(data)
          }
        } else res.status(200).json([])
      }, error => res.status(500).json(error.response.data))
      .catch(error => res.status(500).json(error.response.data))
  })
})

module.exports = router

