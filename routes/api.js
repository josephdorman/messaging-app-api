const cookieJwtAuth = require("../middleware/cookieJwtAuth");
const express = require("express");
const router = express.Router();
const passport = require("passport");

// Require controller modules.
const userController = require("../controllers/userController");
const channelController = require("../controllers/channelController");
const messageController = require("../controllers/messageController");
const friendController = require("../controllers/friendController");

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
  "/users/blocked",
  cookieJwtAuth.cookieJwtAuth,
  userController.get_blocked
);

router.get(
  "/users/channels",
  cookieJwtAuth.cookieJwtAuth,
  userController.get_users_channels
);

router.get("/user/:id", userController.get_user);

// POST //

router.post(
  "/user/block",
  cookieJwtAuth.cookieJwtAuth,
  userController.block_user
);

router.post(
  "/user/unblock",
  cookieJwtAuth.cookieJwtAuth,
  userController.unblock_user
);

router.post(
  "/user/login",
  passport.authenticate("local", { session: false }),
  userController.login_user
);

router.post(
  "/user/logout",
  cookieJwtAuth.cookieJwtAuth,
  userController.logout_user
);

router.post(
  "/user/session",
  cookieJwtAuth.cookieJwtAuth,
  userController.session_user
);

router.post("/user/create", userController.create_user);

/// FRIEND ROUTES ///

// GET //
router.get(
  "/friends",
  cookieJwtAuth.cookieJwtAuth,
  friendController.get_friends
);

router.get(
  "/friends/pending",
  cookieJwtAuth.cookieJwtAuth,
  friendController.get_friend_requests
);

router.get(
  "/friend/:id",
  cookieJwtAuth.cookieJwtAuth,
  friendController.get_friend
);

// POST //

router.post(
  "/friend/search",
  cookieJwtAuth.cookieJwtAuth,
  friendController.get_searched_friends
);

router.post(
  "/friend/search/channel",
  cookieJwtAuth.cookieJwtAuth,
  friendController.get_searched_friends_in_channel
);

router.post(
  "/friend/remove",
  cookieJwtAuth.cookieJwtAuth,
  friendController.remove_friend
);

router.post(
  "/friend/request",
  cookieJwtAuth.cookieJwtAuth,
  friendController.send_friend_request
);

router.post(
  "/friend/accept",
  cookieJwtAuth.cookieJwtAuth,
  friendController.accept_friend_request
);

router.post(
  "/friend/cancel",
  cookieJwtAuth.cookieJwtAuth,
  friendController.cancel_friend_request
);

/// CHANNEL ROUTES ///

// GET //

router.get("/channels", channelController.get_channels);

router.get(
  "/channel/:id/messages",
  cookieJwtAuth.cookieJwtAuth,
  channelController.get_channel_messages
);

router.get("/channel/:id", channelController.get_channel);

// POST //
router.post(
  "/channel/search",
  cookieJwtAuth.cookieJwtAuth,
  channelController.get_searched_channels
);

router.post(
  "/channel/create",
  cookieJwtAuth.cookieJwtAuth,
  channelController.create_channel
);

// DELETE //
router.delete(
  "/channel/delete",
  cookieJwtAuth.cookieJwtAuth,
  channelController.delete_channel
);

/// MESSAGE ROUTES ///

// GET //

// POST //
router.post(
  "/message/create",
  cookieJwtAuth.cookieJwtAuth,
  messageController.create_message
);

module.exports = router;
