'use strict';
const nodeMailer = require('nodemailer');
const ses    = require('nodemailer-ses-transport');
const config = require('../../config')

let sendMail = function (info) {
  let { amazon } = config

  var transporter = nodeMailer.createTransport(ses({
    accessKeyId: amazon.accessKey,
    secretAccessKey: amazon.secretKey,
    region: amazon.region
  }));

  let mailOptions = {
    from: amazon.sender,
    to: info.to,
    subject: info.subject,
    html: info.html
  }

  transporter.sendMail(mailOptions, function (err, data) {
    if(err) {
      console.log("Something has gone wrong!", err);
    } else {
      console.log("Successfully sent with response: ", data);
    }
  });
}

module.exports = sendMail