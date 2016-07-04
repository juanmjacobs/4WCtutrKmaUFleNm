/**
Main application routes
*/

var errors = require("./components/errors");

module.exports = (app) => {
  app.use("/listings", require("./api/listing"));
  app.route("/:url(api|components|app|bower_components|assets)/*").get(errors[404]);
};