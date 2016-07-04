
module.exports = (app) => {
  app.use((err, req, res, next) => {
    if (err == null) {
      return next();
    }
    switch (err.name) {
      case "NotFound":
        return res.sendStatus(404);
      case "ValidationError":
        return res.status(400).send(err);
      default:
        return res.status(500).send(err);
    }
  });
};