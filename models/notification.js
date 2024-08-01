const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  type: {
    type: String,
    enum: ["friend", "channel", "annoucement"],
    required: true,
  },
  body: { type: String, required: true },
});

module.exports = mongoose.model("Notification", NotificationSchema);
