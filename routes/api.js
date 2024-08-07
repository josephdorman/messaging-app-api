const cookieJwtAuth = require("../middleware/cookieJwtAuth");
const express = require("express");
const router = express.Router();
const passport = require("passport");

// Require controller modules.
const userController = require("../controllers/userController");
const channelController = require("../controllers/channelController");
const messageController = require("../controllers/messageController");
const friendController = require("../controllers/friendController");
const notificationController = require("../controllers/notificationController");
const feedbackController = require("../controllers/feedbackController");

/* GET api index. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

/// USER ROUTES ///

// GET //

router.get("/users", cookieJwtAuth.cookieJwtAuth, userController.get_users);

router.get(
  "/user/censored",
  cookieJwtAuth.cookieJwtAuth,
  userController.get_censored
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

router.get("/user/:id", cookieJwtAuth.cookieJwtAuth, userController.get_user);

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

// PUT //
router.put(
  "/user/update/email",
  cookieJwtAuth.cookieJwtAuth,
  userController.update_email
);

router.put(
  "/user/update/username",
  cookieJwtAuth.cookieJwtAuth,
  userController.update_username
);

router.put(
  "/user/update/password",
  cookieJwtAuth.cookieJwtAuth,
  userController.update_password
);

router.put(
  "/user/update/about",
  cookieJwtAuth.cookieJwtAuth,
  userController.update_about
);

/// FRIEND ROUTES ///

// GET //
router.get(
  "/friends",
  cookieJwtAuth.cookieJwtAuth,
  friendController.get_friends
);

router.get(
  "/friends/invites/:id",
  cookieJwtAuth.cookieJwtAuth,
  friendController.get_friend_channel_availability
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
  "/friends/invites/searched",
  cookieJwtAuth.cookieJwtAuth,
  friendController.get_searched_friend_channel_availability
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
  "/friend/request/nosearch",
  cookieJwtAuth.cookieJwtAuth,
  friendController.send_friend_request_nosearch
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

router.get(
  "/channel/:id/users",
  cookieJwtAuth.cookieJwtAuth,
  channelController.get_channel_users
);

router.get(
  "/channel/dm/:id",
  cookieJwtAuth.cookieJwtAuth,
  channelController.get_dm_channel
);

router.get("/channel/:id", channelController.get_channel);

// POST //
router.post(
  "/channel/search",
  cookieJwtAuth.cookieJwtAuth,
  channelController.get_searched_channels
);

router.post(
  "/channel/searched/users",
  cookieJwtAuth.cookieJwtAuth,
  channelController.get_searched_channel_users
);

router.post(
  "/channel/invite",
  cookieJwtAuth.cookieJwtAuth,
  channelController.invite_to_channel
);

router.post(
  "/channel/kick",
  cookieJwtAuth.cookieJwtAuth,
  channelController.kick_from_channel
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

/// NOTIFICATION ROUTES ///

// GET //
router.get(
  "/notifications",
  cookieJwtAuth.cookieJwtAuth,
  notificationController.get_notifications
);

router.get(
  "/notifications/invites",
  cookieJwtAuth.cookieJwtAuth,
  notificationController.get_notifications_invites
);

router.get(
  "/notifications/announcements",
  cookieJwtAuth.cookieJwtAuth,
  notificationController.get_notifications_announcements
);

// POST //
router.post(
  "/notification/remove",
  cookieJwtAuth.cookieJwtAuth,
  notificationController.remove_notification
);

/// FEEDBACK ROUTES ///

// POST //
router.post(
  "/feedback",
  cookieJwtAuth.cookieJwtAuth,
  feedbackController.post_feedback
);

module.exports = router;
