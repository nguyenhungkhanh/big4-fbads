require('dotenv').load();
module.exports = {
  port: process.env.PORT,
  database: process.env.DATABASE_URL,
  account: {
    google: {
      username: process.env.GOOGLE_USERNAME,
      password: process.env.GOOGLE_PASSWORD
    }
  },
  jsonwebtoken: process.env.SECRET_KEY,
  versionGraphFacebook: process.env.VERSION_GRAPH_FACEBOOK,
  amazon: {
    accessKey: process.env.AMAZON_ACCESS_KEY,
    secretKey: process.env.AMAZON_SECRET_KEY,
    region: process.env.AMAZON_REGION ,
    sender: process.env.AMAZON_SES_SENDER
  },
  limitItem: 60
}