const Message = require("../models/message");
const User = require("../models/user");
const Channel = require("../models/channel");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Create a new message
exports.create_message = [
  // Validate and sanitize fields
  body("message", "Message must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id, "messages").populate(
        "messages"
      );

      const channel = await Channel.findById(
        req.body.channelId,
        "messages"
      ).populate("messages");

      const message = new Message({
        channel: channel._id,
        user: user._id,
        date: Date.now(),
        body: req.body.message,
      });

      user.messages.push(message._id);
      channel.messages.push(message._id);

      channel.lastMessage = message._id;

      user.save();
      channel.save();
      message.save();

      res.json({ msg: "Message created!" });
    } catch (err) {
      next(err);
    }
  }),
];
