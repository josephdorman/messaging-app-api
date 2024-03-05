const asyncHandler = require("express-async-handler");
const User = require("../models/user");

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
    console.log(friend.friends[0]);
    res.json(friend.friends[0]);
  } catch (err) {
    next(err);
  }
});
