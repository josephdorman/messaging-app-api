const Channel = require("../models/channel");
const User = require("../models/user");
const Message = require("../models/message");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Return all channels
exports.get_channels = asyncHandler(async (req, res, next) => {
  try {
    const channels = await Channel.find();
    res.json(channels);
  } catch (err) {
    next(err);
  }
});

// Return a single channel
exports.get_channel = asyncHandler(async (req, res, next) => {
  try {
    const channel = await Channel.findById(req.params.id);
    res.json(channel);
  } catch (err) {
    next(err);
  }
});

exports.get_dm_channel = asyncHandler(async (req, res, next) => {
  try {
    const channel = await Channel.findOne(
      {
        users: {
          $all: [req.user.id, req.params.id],
          $size: 2,
        },
        "channelName.main": { $exists: false },
      },
      "_id"
    );

    res.json(channel);
  } catch {
    next(err);
  }
});

// Return searched channels
exports.get_searched_channels = asyncHandler(async (req, res, next) => {
  try {
    const channels = req.body.channel
      ? await User.findById(req.user.id, "channels").populate({
          path: "channels",
          select: "users channelName lastMessage owner",
          populate: { path: "users lastMessage", select: "username body date" },
          match: {
            $or: [
              {
                "channelName.main": { $regex: req.body.channel, $options: "i" },
              },

              {
                "channelName.name1": {
                  $regex: req.body.channel,
                  $options: "i",
                },
              },
              {
                "channelName.name2": {
                  $regex: req.body.channel,
                  $options: "i",
                },
              },
            ],
          },
        })
      : [];

    console.log(channels);
    res.json(channels);
  } catch (err) {
    next(err);
  }
});

// Return messages in channel
exports.get_channel_messages = asyncHandler(async (req, res, next) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate({
        path: "messages",
        populate: { path: "user", select: "username profileIMG" },
      })
      .populate({
        path: "users",
        select: "username profileIMG",
      });

    res.json(channel);
  } catch (err) {
    next(err);
  }
});

// Return users in channel
exports.get_channel_users = asyncHandler(async (req, res, next) => {
  try {
    const users = await Channel.findById(req.params.id, "users").populate({
      path: "users",
      select: "username profileIMG",
      match: { _id: { $ne: req.user.id } },
    });

    res.json(users);
  } catch (err) {
    next(err);
  }
});

// Send user invite to channel
exports.invite_to_channel = asyncHandler(async (req, res, next) => {
  try {
    const mainUser = await User.findById(req.user.id);
    const user = await User.findById(req.body.userId);

    const sendError = (msg) => {
      return res.status(400).json({
        errors: [{ msg: msg }],
      });
    };

    if (user) {
      if (user.channels.includes(req.body.channelId)) {
        sendError("You are already in this channel");
        return;
      } else if (user.channelRequests.received.length > 0) {
        user.channelRequests.received.map((inv) => {
          if (
            inv.user.toString() == req.user.id &&
            inv.channel.toString() == req.body.channelId
          ) {
            sendError("Invite already sent");
            return;
          }
        });
      } else {
        mainUser.channelRequests.sent.push({
          user: req.body.userId,
          channel: req.body.channelId,
        });
        user.channelRequests.received.push({
          user: req.user.id,
          channel: req.body.channelId,
        });

        mainUser.save();
        user.save();

        res.json({ msg: "Invite sent!" });
        return;
      }
    } else {
      sendError("User not found");
      return;
    }
  } catch (err) {
    next(err);
  }
});

// Delete a channel
exports.delete_channel = asyncHandler(async (req, res, next) => {
  try {
    const channel = await Channel.findById(
      req.body.channel,
      "users messages"
    ).populate("users messages");

    const users = await User.updateMany(
      { _id: { $in: channel.users } },
      { $pull: { channels: req.body.channel } },
      { $pull: { messages: { $in: channel.messages } } }
    );

    console.log("past users", channel.messages);
    const deleteMessages = await Message.deleteMany({
      _id: { $in: channel.messages },
    });

    console.log("past messages");
    const deleteChannel = await Channel.findByIdAndDelete(req.body.channel);

    res.json({ msg: "Channel deleted!" });
  } catch (err) {
    next(err);
  }
});

// !IMPORTANT! ///
/// ADD USER WHO REQUESTED THE CHANNEL CREATE TO THE CHANNEL ///

// Create a new channel
exports.create_channel = [
  // Validate and sanitize fields
  body("channelName", "Group name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .isLength({ max: 15 })
    .withMessage("Group name must be 10 characters or less.")
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }

    try {
      const user = await User.findById(req.user.id, "channels").populate(
        "channels"
      );

      const channel = new Channel({
        channelName: {
          main: req.body.channelName,
        },
        owner: user._id,
      });

      console.log(user, channel);

      user.channels.push(channel._id);
      channel.users.push(user._id);

      channel.save();
      user.save();

      res.json({
        msg: "Channel created successfully!",
      });
    } catch (err) {
      next(err);
    }
  }),
];
