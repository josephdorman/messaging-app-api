const Channel = require("../models/channel");
const User = require("../models/user");
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
