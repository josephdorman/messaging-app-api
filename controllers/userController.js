require("dotenv").config();
const User = require("../models/user");
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
      { expiresIn: "30sec" },
      (err, token) => {
        res.json({ token });
      }
    );
  } catch (err) {
    next(err);
  }
});

// Return all users
exports.get_users = asyncHandler(async (req, res, next) => {
  try {
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

/// ADD PASSWORD REQUIRMENTS LIKE 5 CHARS OR MORE/USE ATEAST ONE NUMBER ETC ///
/// MAKE SURE ADD USER TO GLOBAL CHANNEL FROM CHANNEL MODEL ///
/// MAKE SURE TO CHECK THAT EMAIL IS NOT ALREADY IN USE ///

exports.create_user = [
  // Validate and sanitize fields.
  body("username", "Username must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .custom(async (value) => {
      const existingUsername = await User.findOne({ username: value });
      if (existingUsername) {
        throw new Error("Username already in use");
      }
    })
    .escape(),
  body("password", "Password must not be empty.")
    .trim()
    .isLength({ min: 1 })
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
        user.save();
      });
      res.json({
        msg: "User created successfully!",
      });
    } catch (err) {
      next(err);
    }
  }),
];
