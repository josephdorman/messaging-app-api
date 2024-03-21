const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const Channel = require("../models/channel");
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

// Return searched users
exports.get_searched_friends = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id, "friends").populate({
      path: "friends",
      match: { username: { $regex: req.body.username, $options: "i" } },
      select: "username profileIMG",
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Return friend requests
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

// Remove a friend
exports.remove_friend = asyncHandler(async (req, res, next) => {
  try {
    console.log(req.body.friendId, req.user.id);
    const user = await User.findById(req.user.id, "friends");
    const friends = await User.findById(req.body.friendId, "friends");

    user.friends.pull(friends._id);
    friends.friends.pull(user._id);
    user.save();
    friends.save();

    res.json({ msg: "Friend removed!" });
  } catch (err) {
    next(err);
  }
});

// Send a friend request
exports.send_friend_request = [
  // Validate and sanitize fields.
  body("friendName", "Username must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }

    try {
      const user = await User.findById(req.user.id);
      const friend = await User.findOne({
        username: { $regex: req.body.friendName, $options: "i" },
      });

      const sendError = (msg) => {
        return res.status(400).json({
          errors: [{ msg: msg }],
        });
      };

      if (friend) {
        // Check if sending to self
        if (user._id.toString() === friend._id.toString()) {
          sendError("You can't send a friend request to yourself");
          return;
        }
        if (friend.blocked.includes(user._id)) {
          sendError("The user you're trying to add has blocked you");
          return;
        }
        if (user.blocked.includes(friend._id)) {
          sendError("You can't send a friend request to a blocked user");
          return;
        }
        // Check if already friends
        if (user.friends.includes(friend._id)) {
          sendError("Already friends with this user");
          return;
        }
        // Check if already sent a friend request
        if (user.friendRequests.sent.includes(friend._id)) {
          sendError("Already sent a friend request to this user");
          return;
        }

        friend.friendRequests.received.push(req.user.id);
        user.friendRequests.sent.push(friend._id);
        friend.save();
        user.save();
      } else {
        sendError("User not found");
        return;
      }

      res.json({ msg: "Friend request sent!" });
    } catch (err) {
      next(err);
    }
  }),
];

// Accept friend request
exports.accept_friend_request = asyncHandler(async (req, res, next) => {
  try {
    console.log(req.body.friendId, req.user.id);
    const user = await User.findById(req.user.id, "friends friendRequests");
    const friend = await User.findById(
      req.body.friendId,
      "friends friendRequests"
    );

    const channel = new Channel({
      users: [user._id, friend._id],
    });

    user.friends.push(friend._id);
    friend.friends.push(user._id);

    user.friendRequests.received.pull(friend._id);
    friend.friendRequests.sent.pull(user._id);

    channel.save();
    user.save();
    friend.save();

    res.json({ msg: "Friend request accepted!" });
  } catch (err) {
    next(err);
  }
});

// Cancel friend request
exports.cancel_friend_request = asyncHandler(async (req, res, next) => {
  try {
    const type = req.body.type;
    const user = await User.findById(req.user.id, "friends friendRequests");
    const friend = await User.findById(
      req.body.friendId,
      "friends friendRequests"
    );

    if (type === "outgoing") {
      user.friendRequests.sent.pull(friend._id);
      friend.friendRequests.received.pull(user._id);
    } else {
      user.friendRequests.received.pull(friend._id);
      friend.friendRequests.sent.pull(user._id);
    }

    user.save();
    friend.save();

    res.json({ msg: "Friend request canceled!" });
  } catch (err) {
    next(err);
  }
});
