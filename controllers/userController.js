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
