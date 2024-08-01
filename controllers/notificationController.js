const asyncHandler = require("express-async-handler");
const Notification = require("../models/notification");
const User = require("../models/user");

exports.get_notifications = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id, "notifications").populate({
      path: "notifications",
      populate: {
        path: "user",
        select: "username profileIMG",
      },
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
});

exports.get_notifications_invites = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id, "notifications").populate({
      path: "notifications",
      populate: {
        path: "user",
        select: "username profileIMG",
      },
      match: { $or: [{ type: "friend" }, { type: "channel" }] },
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
});

exports.get_notifications_announcements = asyncHandler(
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id, "notifications").populate({
        path: "notifications",
        populate: {
          path: "user",
          select: "username profileIMG",
        },
        match: { type: "announcement" },
      });

      res.json(user);
    } catch (err) {
      next(err);
    }
  }
);

exports.remove_notification = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id, "notifications");
    const notif = await Notification.findByIdAndDelete(req.body.notifId);

    user.notifications.pull(req.body.notifId);
    user.save();

    res.json({ msg: "Notification removed!" });
  } catch (err) {
    next(err);
  }
});
