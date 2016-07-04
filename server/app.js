/**
Main application file
*/

var PrettyError = require("pretty-error");

new PrettyError().start();

process.env.NODE_ENV = process.env.NODE_ENV || "development";

var express = require("express");

var mongoose = require("mongoose");

var config = require("./config/environment");

mongoose.connect(config.mongo.uri, config.mongo.options);

var app = express();

var server = require("http").createServer(app);

require("./config/express")(app);

require("./routes")(app);

require("./errorHandler")(app);

module.exports = {
  app: app,
  server: server,
  ip: config.ip,
  port: config.port,
  env: app.get("env")
};