const cookieJwtAuth = require("../middleware/cookieJwtAuth");
const express = require("express");
const router = express.Router();
const passport = require("passport");

// Require controller modules.
const userController = require("../controllers/userController");
const channelController = require("../controllers/channelController");

/* GET api index. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

/// USER ROUTES ///

// GET //

router.get(
  "/users",
  // passport.authenticate("jwt", { session: false }),
  userController.get_users
);

router.get(
  "/user/friends",
  cookieJwtAuth.cookieJwtAuth,
  userController.get_user_friends
);

router.get("/user/:id", userController.get_user);

// POST //

router.post(
  "/user/login",
  passport.authenticate("local", { session: false }),
  userController.login_user
);

router.post(
  "/user/session",
  cookieJwtAuth.cookieJwtAuth,
  userController.session_user
);

router.post("/user/create", userController.create_user);

/// CHANNEL ROUTES ///

// GET //

router.get("/channels", channelController.get_channels);

router.get("/channel/:id", channelController.get_channel);

// POST //

router.post("/channel/create", channelController.create_channel);

module.exports = router;
