'use strict';
const nodemailer = require('nodemailer');
const config = require('../../config')

let sendMail = function (info) {
  let { account } = config
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: account.google.username,
      pass: account.google.password
    }
  })
  let mailOptions = {
    from: `"NHK 👻" <${account.google.username}>`,
    to: info.to,
    subject: info.subject,
    html: info.html
  };

  return new Promise((resolve, reject) => {
    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) reject(error)
    //   else 
      resolve()
    // });
  })
}

module.exports = sendMail