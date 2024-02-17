require("dotenv").config();
const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.cookieJwtAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;
  try {
    const user = jwt.verify(token, process.env.SECRET_KEY);
    req.user = user;
    const currentUser = await User.findById(user.id, "_id username profileIMG");
    console.log(currentUser);
    res.json(currentUser);
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.send(false);
  }
});
