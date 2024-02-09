const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  channel: { type: Schema.Types.ObjectId, ref: "Channel" },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, default: Date.now },
  body: { type: String, required: true },
});

module.exports = mongoose.model("Message", MessageSchema);
