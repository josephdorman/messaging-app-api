const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const { body, validationResult } = require("express-validator");

// Return all friends
exports.get_friends = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id, "friends").populate(
      "friends",
      "username profileIMG"
    );
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Return specific friend
exports.get_friend = asyncHandler(async (req, res, next) => {
  try {
    const friend = await User.findById(req.user.id)
      .select("friends")
      .populate({
        path: "friends",
        match: { _id: req.params.id },
        select: "username profileIMG",
      });
    // console.log(friend.friends[0]);
    res.json(friend.friends[0]);
  } catch (err) {
    next(err);
  }
});

exports.get_friend_requests = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select("friendRequests")
      .populate({
        path: "friendRequests.sent friendRequests.received",
        select: "username profileIMG",
      });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Send a friend request
exports.send_friend_request = [
  // Validate and sanitize fields.
  body("name", "Username must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id);
      const friend = await User.findOne({
        username: { $regex: req.body.friendName, $options: "i" },
      });

      if (friend) {
        // Check if already friends
        if (user.friends.includes(friend._id)) {
          return res.json({ msg: "Already friends with this user" });
        }
        // Check if already sent a friend request
        if (user.friendRequests.sent.includes(friend._id)) {
          return res.json({
            msg: "Already sent a friend request to this user",
          });
        }

        friend.friendRequests.received.push(req.user.id);
        user.friendRequests.sent.push(friend._id);
        friend.save();
        user.save();
      } else {
        return res.json({ msg: "User not found!" });
      }

      res.json({ msg: "Friend request sent!" });
    } catch (err) {
      next(err);
    }
  }),
];
