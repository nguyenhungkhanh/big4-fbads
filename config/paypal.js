var paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AUeYksCMa95ep11Ua1MkMzu88FvmVAchHuw4wkFrBObAvZscfqQ8lDuc39MCiiuLQNcUhxwwehbNite7',
  'client_secret': 'EFREVdS69lyp5g2TfwamW9TJMn-FN0uANxarGROBNbjansqipYjVr2Mo9Px2AfvKW45KgUXuGF40kbGC'
});

module.exports = paypal