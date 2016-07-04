require("./srv-globals");

var app = require("./app.js");

app.server.listen(app.port, app.ip, () =>
  console.log("Express server listening on %d, in %s mode", app.port, app.env)
);