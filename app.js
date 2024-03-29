require("dotenv").config();
const mongoose = require("mongoose");
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const cors = require("cors");
const LocalStrategy = require("passport-local").Strategy;
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");

const User = require("./models/user");

const indexRouter = require("./routes/index");
const apiRouter = require("./routes/api");

const CONNECTION_URL = process.env.MONGOOSE_CONNECTION;
const JWT_SECRET = process.env.SECRET_KEY;

const app = express();

mongoose.connect(CONNECTION_URL);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Passport Authentication
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });

      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return done(null, false, { message: "Incorrect password." });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// Passport JWT Authorization
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async function (jwt_payload, done) {
      try {
        const user = await User.findOne({
          _id: jwt_payload.id,
        });

        if (!user) {
          return done(null, false);
        }
        return done(null, user, { message: "Authorized Successfully" });
      } catch (err) {
        return done(err);
      }
    }
  )
);

app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/api/v1", apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send("error");
});

module.exports = app;
