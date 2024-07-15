require("dotenv").config();
const User = require("../models/user");
const Channel = require("../models/channel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const JWT_SECRET = process.env.SECRET_KEY;

const globalChannelId = "65c6e4d2e66df1ba996deeda";

// LOGIN USER
exports.login_user = asyncHandler(async (req, res, next) => {
  try {
    jwt.sign(
      { id: req.user._id },
      JWT_SECRET,
      { expiresIn: "1hr" },
      (err, token) => {
        res
          .cookie("token", token, {
            httpOnly: true,
          })
          .json({
            user: {
              id: req.user._id,
              username: req.user.username,
              profileIMG: req.user.profileIMG,
            },
          });
      }
    );
  } catch (err) {
    next(err);
  }
});

// LOGOUT USER
exports.logout_user = asyncHandler(async (req, res, next) => {
  try {
    res.clearCookie("token");
    res.json({ msg: "Logged out successfully!" });
  } catch (err) {
    next(err);
  }
});

exports.session_user = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id, "username profileIMG");
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Return all users
exports.get_users = asyncHandler(async (req, res, next) => {
  try {
    console.log(req.signedCookies);
    const users = await User.find({}, "username profileIMG");
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// Return a single user
exports.get_user = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id, "username profileIMG");
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Return blocked users
exports.get_blocked = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id, "blocked").populate(
      "blocked",
      "username profileIMG"
    );
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Return a users channels
exports.get_users_channels = asyncHandler(async (req, res, next) => {
  try {
    const channels = await User.findById(req.user.id, "channels").populate({
      path: "channels",
      select: "users channelName lastMessage owner",
      populate: {
        path: "users channelName lastMessage",
        select: "username body date",
      },
    });

    res.json(channels);
  } catch (err) {
    next(err);
  }
});

// Block a user
/// THESE SHOULD ALREADY BE ACCOUNT FOR BY THE NATURE OF HOW THE LIST WORKDS
/// Cant block yourself
/// Cant block a user who is already blocked
exports.block_user = asyncHandler(async (req, res, next) => {
  try {
    const friend = await User.findById(req.body.friendId, "friends channels");
    const user = await User.findById(req.user.id, "friends channels blocked");
    const channel = await Channel.findOne({
      users: {
        $all: [user._id, friend._id],
        $size: 2,
      },
      "channelName.main": { $exists: false },
    });

    if (channel) {
      user.channels.pull(channel._id);
      friend.channels.pull(channel._id);
    }

    user.friends.pull(friend._id);
    friend.friends.pull(user._id);

    user.blocked.push(friend._id);

    user.save();
    friend.save();

    res.json({ msg: "User blocked!" });
  } catch (err) {
    next(err);
  }
});

exports.unblock_user = asyncHandler(async (req, res, next) => {
  try {
    const friend = await User.findById(req.body.friendId, "_id");
    const user = await User.findById(req.user.id, "blocked");
    user.blocked.pull(friend._id);
    user.save();

    res.json({ msg: "User unblocked!" });
  } catch (err) {
    next(err);
  }
});

// Create a new user

/// LOWER PASSWORD REQ POSSIBLY ///

exports.create_user = [
  // Validate and sanitize fields.
  body("username", "Username must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .custom(async (value) => {
      const existingUsername = await User.findOne({
        username: { $regex: value, $options: "i" },
      });
      if (existingUsername) {
        throw new Error("Username already in use");
      }
    })
    .escape(),
  body(
    "password",
    "Password needs to be atleast 5 characters long, have one uppercase, one lowercase, one number and one symbol."
  )
    .trim()
    /*
    .isStrongPassword({
      minLength: 5,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    */
    .escape(),
  body("email", "Email must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .isEmail()
    .withMessage("Not a valid e-mail address")
    .custom(async (value) => {
      const existingEmail = await User.findOne({ email: value });
      if (existingEmail) {
        throw new Error("Email already in use");
      }
    })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) throw err;

        const user = new User({
          username: req.body.username,
          password: hashedPassword,
          email: req.body.email,
          channels: globalChannelId,
        });

        const channel = await Channel.findById(globalChannelId);
        channel.users.push(user._id);

        user.save();
        channel.save();
      });
      res.json({
        msg: "User created successfully!",
      });
    } catch (err) {
      next(err);
    }
  }),
];
