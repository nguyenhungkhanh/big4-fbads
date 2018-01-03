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
  versionGraphFacebook: process.env.VERSION_GRAPH_FACEBOOK
}