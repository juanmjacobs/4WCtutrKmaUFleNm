var express = require("express");
var controller = require("./listing.controller");
var config = include("config/environment");
var router = express.Router();

router.get("/", controller.getAll);

router.post("/", controller.create);

router.get("/:listing_id", controller.getOne);

router.put("/:listing_id", controller.update);

router.post("/upsert", controller.upsert);

module.exports = router;
