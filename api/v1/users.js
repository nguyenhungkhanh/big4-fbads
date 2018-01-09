var express = require('express')
var randomstring = require('randomstring')
var User = require('../../models/user.js')
var Customer = require('../../models/customer.js')
var Token = require('../../models/token.js')
var sendMail = require('../vendor/sendMail.js')
var nodemailer = require('nodemailer')
var async = require('async')
var jwt = require('jsonwebtoken')
var config = require('../../config')
var setToken = require('../../middlewave/setToken')

const router = express.Router()

function checkRole(req, res, next) {
  if (req.decode.role !== null && req.decode.role < 2) next()
  else res.status(403).json({ message: 'Bạn không có quyền truy cập api này!!!' })
}

router.post('/password/:type/:idClient', setToken, (req, res) => {
  let { params } = req.params

  if (req.decode.role !== null) {
    if (req.params.type === 'user') {
      User.findById(req.params.idClient, (error, user) => {
        if (error) res.status(500).json(error)
        else {
          if (user) {
            let newPassword = randomstring.generate(10)
            user.password = newPassword
            user.save((errorPassword, newPassword) => {
              if (errorPassword) res.status(500).json(errorPassword)
              else res.status(200).json({ success: true })
            })
            let info = {
              to: [user.email],
              subject: 'Thông tin tài khoản',
              html: `
                <h1>Thông tin tài khoản</h1>
                <b>Usename</b>: ${ user.username }<br />
                <b>Email</b>: ${ user.email }<br />
                <b>Mật khẩu</b>: ${ newPassword }<br />
                Bạn có thể sử dụng username hoặc email để đăng nhập vào hệ thống.
              `
            }
            sendMail(info)
          } else {
            res.status(404).json({ status: 404, success: false, message: 'Object not found.' })
          }
        }
      })
    }
    if (req.params.type === 'customer') {
      Customer.findById(req.params.idClient, (error, customer) => {
        if (error) res.status(500).json(error)
        else {
          if (customer) {
            let newPassword = randomstring.generate(10)
            customer.password = newPassword
            customer.save((errorPassword, newPassword) => {
              if (errorPassword) res.status(500).json(errorPassword)
              else res.status(200).json({ success: true })
            })
            let info = {
              to: [customer.email],
              subject: 'Thông tin tài khoản',
              html: `
                <h1>Thông tin tài khoản</h1>
                <b>Usename</b>: ${ customer.username }<br />
                <b>Email</b>: ${ customer.email }<br />
                <b>Mật khẩu</b>: ${ newPassword }<br />
                Bạn có thể sử dụng username hoặc email để đăng nhập vào hệ thống.
              `
            }
            sendMail(info)
          } else {
            res.status(404).json({ status: 404, success: false, message: 'Object not found.' })
          }
        }
      })
    }
  } else {
    res.status(403).json({ status: 403, success: false, message: 'Bạn không có quyền để thực hiện hành động này.' })
  }
})

router.get('/', setToken, checkRole, (req, res) => {
    var pageOptions = {
      page: parseInt(req.query.page) || 0,
      limit: parseInt(req.query.limit) || 8
    }
    User.find()
      .skip(pageOptions.page * pageOptions.limit)
      .limit(pageOptions.limit)
      .exec(function (error, users) {
        if (error) {
          res.status(500).json(error);
          return;
        };
        users = users.filter(user => {
          return user.role > req.decode.role
        })
        res.status(200).json(users);
      })
  })

router.post('/', setToken, checkRole, (req, res) => {
    let newUser = new User(req.body)
    newUser.password = randomstring.generate(10)
    newUser.created_time = new Date()
    newUser.save((error, customer) => {
      if (error) res.status(500).json(error)
      else res.status(200).json(customer)
    })
    // Tắt chức năng gửi mail
    // let info = {
    //   to: [req.body.email],
    //   subject: 'Thông tin tài khoản',
    //   html: `
    //   <h1>Thông tin tài khoản</h1>
    //   <b>Usename</b>: ${ req.body.username}<br />
    //   <b>Email</b>: ${req.body.email}<br />
    //   <b>Mật khẩu</b>: ${ newUser.password}<br />
    //   Bạn có thể sử dụng username hoặc email để đăng nhập vào hệ thống.
    // `
    // }
    // sendMail(info)
  })

router.post('/verify', (req, res) => {
    User.findOne({
      $or: [{
        username: req.body.identify
      }, {
        email: req.body.identify
      }]
    }, (error, user) => {
      if (error) res.status(400).json(error)
      else {
        if (user && user.comparePassword(req.body.password)) {
          Token.findOne({ user: user._id }, (errorToken, token) => {
            if (errorToken) res.status(500).json(errorToken)
            else {
              let time = new Date(),
                timeString = `${time.getDate()}/${time.getMonth() + 1}/${time.getFullYear()} lúc ${time.getHours()}:${time.getMinutes()}`
              // Tắt chức năng gửi mail
              // let info = {
              //   to: [user.email],
              //   subject: `Mã xác nhận đăng nhập ${timeString}`,
              //   html: null
              // }
              if (token) {
                let code;
                jwt.verify(token.verify, config.jsonwebtoken, (errorJwt, decode) => {
                  if (errorJwt) {
                    if (errorJwt.name === 'TokenExpiredError') { // Token verify hết hạn
                      // code = randomstring.generate(4) Tạm xóa fix cứng thành 1234
                      code = "1234"
                      verify = jwt.sign({
                        id: user._id,
                        verify: code
                      }, config.jsonwebtoken, { expiresIn: 60 * 15 })
                      token.verify = verify
                      token.save((errorNewToken, newToken) => {
                        if (errorNewToken) res.status(500).json({ success: false, message: errorNewToken })
                        else {
                          res.status(200).json({ success: true })
                        // Tắt chức năng gửi mail
                        //   info.html = `
                        //   Mã xác nhận dăng nhập ${code} 
                        // `
                        //   sendMail(info)
                        }
                      })
                    } else {
                      res.status(500).json({ success: false, message: errorJwt })
                    }
                  } else {
                    Token.findOne({ user: decode.id }, (errorTokenOld, tokenOld) => {
                      if (errorTokenOld) res.status(500).json({ errorTokenOld })
                      else {
                        res.status(200).json({ success: true })
                      // Tắt chức năng gửi mail
                      //   code = decode.verify
                      //   info.html = `
                      //   Mã xác nhận dăng nhập ${code} 
                      // `
                      //   sendMail(info)
                      }
                    })
                  }
                })
              } else {
                // code = randomstring.generate(4) tạm xóa để fix cứng về 1234
                code = "1234"
                verify = jwt.sign({
                  id: user._id,
                  verify: code
                }, config.jsonwebtoken, { expiresIn: 60 * 15 })
              // tắt chức năng gửi mail
              //   info.html = `
              //   Mã xác nhận dăng nhập ${code} 
              // `
              //   sendMail(info)

                let newToken = new Token({
                  user: user._id,
                  type: 'user',
                  value: null,
                  verify
                })
                newToken.save((error, token) => {
                  if (error) res.status(500).json(error)
                  else res.status(200).json({ success: true, token })
                })
              }
            }
          })
        } else {
          res.status(400).json({
            error: 'Mật khẩu không đúng'
          })
        }
      }
    })
  })


router.post('/login', (req, res) => {
    User.findOne({
      $or: [{
        username: req.body.identify
      }, {
        email: req.body.identify
      }]
    }, (error, user) => {
      if (error) res.status(500).json(error)
      else {
        Token.findOne({ user: user._id }, (errorToken, token) => {
          if (errorToken) res.status(500).json(errorToken)
          else {
            jwt.verify(token.verify, config.jsonwebtoken, (errorJwt, decode) => {
              if (errorJwt) res.status(401).json(errorJwt);
              else {
                if (decode.verify === req.body.verify) {
                  const token = jwt.sign({
                    id: user._id,
                    username: user.username,
                    role: user.role
                  }, config.jsonwebtoken, { expiresIn: 60 * 60 * 24 * 60 })
                  res.status(200).json({ token, role: user.role, success: true })
                } else {
                  res.status(500).json({ success: false, message: 'Mã xác nhận không đúng. Vui lòng kiểm tra lại mã xác nhận trong email.' })
                }
              }
            })
          }
        })
      }
    })
  })

router.put('/:idUser', setToken, checkRole, (req, res) => {
    User.findByIdAndUpdate(req.params.idUser, req.body.user, (error, user) => {
      if (error) res.status(500).json(error)
      else {
        user.username = req.body.username || user.username
        user.email = req.body.email || user.email
        user.name = req.body.name || user.name
        if (req.body.active !== undefined) {
          user.active = req.body.active
        }
        user.role = req.body.role || user.role

        user.save((error, newUser) => {
          if (error) res.status(500).json(error)
          else res.status(200).json(newUser)
        });
      }
    })
  })

router.delete('/:idUser', setToken, checkRole, (req, res) => {
    User.findById(req.params.idUser, (error, user) => {
      if (error) res.status(500).json(error)
      else {
        if (user) {
          user.is_active = !user.is_active
          user.save((newError, newUser) => {
            if (newError) res.status(500).json(newError)
            else res.status(200).json(newUser)
          })
        } else res.status(200).json({ message: "Người dùng không tồn tại" })
      }
    })
  })

module.exports = router