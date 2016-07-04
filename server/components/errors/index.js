/**
Error responses
 */

module.exports[404] = pageNotFound = (req, res) => {
  var result, statusCode, viewFilePath;
  viewFilePath = "404";
  statusCode = 404;
  result = {
    status: statusCode
  };
  res.status(result.status);
  res.render(viewFilePath, (err) => {
    if (err) {
      return res.json(result, result.status);
    }
    res.render(viewFilePath);
  });
};