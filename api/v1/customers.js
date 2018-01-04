var express = require('express')
var randomstring = require('randomstring')
var Customer = require('../../models/customer.js')
var sendMail = require('../vendor/sendMail.js')
var nodemailer = require('nodemailer')
var async = require('async')
var jwt = require('jsonwebtoken')
var config = require('../../config')
var setToken = require('../../middlewave/setToken')
var Token = require('../../models/token')
var paypal = require('../../config/paypal')

const adsSdk = require('facebook-nodejs-ads-sdk');
const AdAccount = adsSdk.AdAccount;
const Campaign = adsSdk.Campaign;
// const accessToken = '<VALID_ACCESS_TOKEN>';
// const api = adsSdk.FacebookAdsApi.init(accessToken);
// const account = new AdAccount('<AD_ACCOUNT_ID>');

const router = express.Router()

function checkRole(req, res, next) {
  if (req.decode.role !== null) next()
  else res.status(403).json({ message: 'Bạn không có quyền truy cập api này!!!' })
}

router.get('/', setToken, checkRole, (req, res) => {
  var pageOptions = {
    page: parseInt(req.query.page) || 0,
    limit: parseInt(req.query.limit) || 8
  }
  Customer.find()
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .exec(function (error, customers) {
      if (error) {
        res.status(500).json(error);
        return;
      };
      res.status(200).json(customers);
    })
})



router.get('/ads', setToken, (req, res) => {
  let { decode } = req
  Customer.findById(decode.id, (error, customer) => {
    if (error) res.status(500).json(error)
    else {
      let accessToken = customer.accessToken.value || '<VALID_ACCESS_TOKEN>';
      let api = adsSdk.FacebookAdsApi.init(accessToken);
      let account = new AdAccount(customer.facebook_app_id);
      console.log('customer')
      account.getCampaigns([Campaign.Fields.name])
        .then((campaigns) => {
          console.log(campaigns)
          res.status(200).json(campaigns)
          // if (campaigns.length >= 2 && campaigns.hasNext()) {
          //   return campaigns.next();
          // } else {
          //   Promise.reject(
          //     new Error('campaigns length < 2 or not enough campaigns')
          //   );
          // }
        })
        // .then((campaigns) => {
        //   if (campaigns.hasNext() && campaigns.hasPrevious()) {
        //     return campaigns.previous();
        //   } else {
        //     Promise.reject(
        //       new Error('previous or next is not true')
        //     );
        //   }
        //   return campaigns.previous();
        // })
        .catch((error) => {
        });
    }
  })
})

router.post('/ads', setToken, (req, res) => {
  let { decode } = req
  Customer.findById(decode.id, (error, customer) => {
    if (error) res.status(500).json(error)
    else {
      let accessToken = customer.accessToken.value || '<VALID_ACCESS_TOKEN>';
      let api = adsSdk.FacebookAdsApi.init(accessToken);
      let account = new AdAccount(customer.facebook_app_id);
      console.log(accessToken)
      console.log(Campaign.Objective)
      account
        .createCampaign(
        [],
        {
          [Campaign.Fields.name]: 'Page likes campaign', // Each object contains a fields map with a list of fields supported on that object.
          // [Campaign.Fields.status]: Campaign.Status.paused,
          // [Campaign.Fields.objective]: Campaign.Objective.link_clicks
        }
        )
        .then((campaign) => {
          res.status(200).json(campaign)
        })
        .catch((error) => {
          res.status(500).json(error)
        });
    }
  })
})

router.post('/', (req, res) => {
  let newCustomer = new Customer(req.body)
  // newCustomer.password = randomstring.generate(10)
  newCustomer.created_time = new Date()
  // let info = {
  //   to: req.body.email,
  //   subject: 'Thông tin tài khoản',
  //   html: `
  //     <h1>Thông tin tài khoản</h1>
  //     <b>Usename</b>: ${ req.body.username}<br />
  //     <b>Email</b>: ${req.body.email}<br />
  //     <b>Mật khẩu</b>: ${ newCustomer.password}<br />
  //     Bạn có thể sử dụng username hoặc email để đăng nhập vào hệ thống.
  //   `
  // }

  // sendMail(info)
  //   .then(() => {
  //     newCustomer.save((error, customer) => {
  //       if (error) res.status(500).json(error)
  //       else res.status(200).json(customer)
  //     })
  //   }, errorSendEmail => {
  //     newCustomer.save((error, customer) => {
  //       if (error) {
  //         error.sendMail = errorSendEmail;
  //         res.status(500).json(error)
  //       } else res.status(200).json({
  //         customer,
  //         warning: errorSendEmail
  //       })
  //     })
  //   })

  newCustomer.save((error, customer) => {
    if (error) res.status(500).json(error)
    else {
      console.log('customer._id', customer._id)
      res.status(200).json(customer)
    }
  })
})

router.post('/login', (req, res) => {
  Customer.findOne({ $or: [{ username: req.body.identify }, { email: req.body.identify }] }, (error, customer) => {
    if (error) res.status(400).json(error)
    else {
      if (customer.comparePassword(req.body.password)) {
        Token.findOne({ user: customer._id }, (err, findToken) => {
          if (err) res.status(500).json(err)
          else {
            const token = jwt.sign({
              id: customer._id,
              username: customer.username,
              role: customer.role || null
            }, config.jsonwebtoken, { expiresIn: 60 * 60 * 24 })
            if (!findToken) {
              let newToken = new Token({
                user: customer._id,
                type: 'customer',
                value: token
              })
              newToken.save((errorToken, tokenNew) => {
                if (errorToken) res.status(500).json(errorToken)
                else res.status(200).json({ token, success: true })
              })
            } else {
              res.status(200).json({ token, success: true })
            }
          }
        })
      } else {
        res.status(400).json({ error: 'Mật khẩu không đúng' })
      }
    }
  })
})

router.post('/login-facebook', (req, res) => {
  Customer.findOne({ facebook_app_id: req.body.userID }, (error, customer) => {
    if (error) res.status(500).json(error)
    else {
      if (customer) {
        Token.findOne({ user: customer._id }, (err, findToken) => {
          if (err) res.status(500).json(err)
          else {
            const token = jwt.sign({
              id: customer._id,
              username: customer.name,
              role: customer.role || null
            }, config.jsonwebtoken, { expiresIn: 60 * 60 * 24 })
            if (!findToken) {
              let newToken = new Token({
                user: customer._id,
                type: 'customer',
                value: token
              })
              newToken.save((errorToken, tokenNew) => {
                if (errorToken) res.status(500).json(errorToken)
                else res.status(200).json({ token, success: true })
              })
            } else {
              res.status(200).json({ token, success: true })
            }
          }
        })
      } else {
        res.status(200).json({ success: false })
      }
      customer.accessToken = req.body.accessToken || {}
      customer.save()
    }
  })
})

router.put('/:idCustomer', (req, res) => {
  Customer.findByIdAndUpdate(req.params.idCustomer, req.body.customer, (error, customer) => {
    if (error) res.status(500).json(error)
    else {
      customer.username = req.body.username || customer.username
      customer.email = req.body.email || customer.email
      customer.name = req.body.name || customer.name
      customer.phone = req.body.phone || customer.phone
      customer.address = req.body.address || customer.address
      if (req.body.active !== undefined) {
        customer.active = req.body.active
      }
      customer.type = req.body.type || customer.type

      customer.save((error, newCustomer) => {
        if (error) res.status(500).json(error)
        else res.status(200).json(newCustomer)
      });
    }
  })
})

router.delete('/:idCustomer', (req, res) => {
  Customer.findById(req.params.idCustomer, (error, customer) => {
    if (error) res.status(500).json(error)
    else {
      if (customer) {
        customer.is_active = !customer.is_active
        customer.save((newError, newCustomer) => {
          if (newError) res.status(500).json(newError)
          else res.status(200).json(newCustomer)
        })
      } else res.status(200).json({ message: "Người dùng không tồn tại" })
    }
  })
})

router.get('/paypal/create-payment', (req, res) => {
  var create_payment_json = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:3030/api/v1/customers/paypal/success",
      "cancel_url": "http://localhost:3030/api/v1/customers/paypal/cancel"
    },
    "transactions": [{
      "item_list": {
        "items": [{
          "name": "item",
          "sku": "item",
          "price": "1.00",
          "currency": "USD",
          "quantity": 1
        }]
      },
      "amount": {
        "currency": "USD",
        "total": "1.00"
      },
      "description": "This is the payment description."
    }]
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      console.log(error)
      res.status(500).json(error)
    } else {
      console.log("Create Payment Response");
      console.log(payment);
      res.status(200).json(payment)
      // for(let i = 0; i < payment.links.length; i++) {
      //   if(payment.links[i].rel === 'approval_url') {
      //     res.redirect(payment.links[i].href)
      //   }
      // }
    }
  });
})

router.post('/paypal/execute-payment', (req, res) => {
  const payerId = req.body.payerID
  const paymentId = req.body.paymentID

  console.log(payerId, paymentId)
  const executeJSON = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": "1.00"
      }
    }]
  }

  paypal.payment.execute(paymentId, executeJSON, (error, payment) => {
    if(error) res.status(500).json(error)
    else {
      res.status(200).json(payment)
    }
  })
})

module.exports = router