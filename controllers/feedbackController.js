const Feedback = require("../models/feedback");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Post a feedback to db
exports.post_feedback = [
  // Validate and sanitize fields
  body("message", "Message must not be empty, max characters: 1250.")
    .trim()
    .isLength({ min: 1, max: 1250 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }

    try {
      const feedback = new Feedback({
        user: req.user.id,
        body: req.body.message,
      });

      feedback.save();

      res.json({ msg: "Feedback sent!" });
    } catch (err) {
      next(err);
    }
  }),
];
