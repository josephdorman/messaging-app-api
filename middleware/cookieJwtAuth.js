require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.cookieJwtAuth = (req, res, next) => {
  const token = req.cookies.token;
  try {
    jwt.verify(token, process.env.SECRET_KEY);
    res.send({ msg: "Authorized" });
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.send({ msg: "Unauthorized" });
  }
};
