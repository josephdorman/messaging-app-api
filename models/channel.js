const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ChannelSchema = new Schema({
  name: { type: String },
  users: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
  lastMessage: { type: String },
});

module.exports = mongoose.model("Channel", ChannelSchema);
