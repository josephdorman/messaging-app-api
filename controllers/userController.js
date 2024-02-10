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
  jwt.sign(
    /// CHANGE TO USE ENCRYPTED PASS FOR THE SIGNATURE ///
    { username: req.body.username, password: req.body.password },
    JWT_SECRET,
    { expiresIn: "30sec" },
    (err, token) => {
      res.json({ token });
    }
  );
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

/// ADD PASSWORD REQUIRMENTS LIKE 5 CHARS OR MORE/USE ATEAST ONE NUMBER ETC///
exports.create_user = [
  // Validate and sanitize fields.
  body("username", "Username must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("password", "Password must not be empty.")
    .trim()
    .isLength({ min: 1 })
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
