var path = require("path");

try {
  require("./" + process.env.NODE_ENV);
} catch (error) {
}

module.exports = {
  env: process.env.NODE_ENV,
  root: path.normalize(__dirname + "/../../.."),
  port: process.env.PORT || 9000,
  seedDB: false,
  secrets: {
    session: process.env.SESSION_SECRET || "listing-tracker-secret"
  },
  mongo: {
    uri: process.env.MONGO_URI,
    options: {
      db: {
        safe: true
      }
    }
  }
};