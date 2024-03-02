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
