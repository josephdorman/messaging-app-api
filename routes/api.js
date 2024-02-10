const express = require("express");
const router = express.Router();

// Require controller modules.
const userController = require("../controllers/userController");
const channelController = require("../controllers/channelController");

/* GET api index. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

module.exports = router;
