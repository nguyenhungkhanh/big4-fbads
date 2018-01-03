var jwt = require('jsonwebtoken')
var User = require('../models/user.js')
var config = require('../config')

module.exports = (req, res, next) => {
  const authorizationHeader = req.headers['authorization'];
  const isTokenRegex = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;
  let token;
  /**
   * có 2 cách gửi token:
   * 1: gửi token trên url, api/xxx?token=yyyyyy  =>> chưa bắt trường hợp này
   * 2: gửi token trong hearder: dạng Bearer <token> =>> xử lý như hiện tại chưa ổn, dùng regex để bắt đúng định dạng
   * 
   */
  if (authorizationHeader) {
    token = authorizationHeader.split(' ')[1];
    if(!isTokenRegex.test(token)) token = null 
  }
  if (req.query.token && isTokenRegex.test(req.query.token)) {
    token = req.query.token
  }

  if (token) {
    jwt.verify(token, config.jsonwebtoken, (error, decode) => {
      if (error) {
        if(error.name === 'TokenExpiredError') {
          res.status(500).json({ status: 500, message: 'TokenExpiredError'}) 
        } else res.status(401).json(error);
      } else {
        User.findById(decode.id, (error, user) => {
          if (error) res.status(500).json(error)
          else {
            req.decode = decode
            next()
          }
        })
      }
    })
  } else {
    res.status(401).json({ err: 'You need token!!!' }); // code ở đây là 403 hay 401?? 
    // Sửa 403 -> 401
  }
}
