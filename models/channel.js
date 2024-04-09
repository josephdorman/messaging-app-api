const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ChannelSchema = new Schema({
  name: { type: String },
  channelName: {
    main: { type: String },
    name1: { type: String },
    name2: { type: String },
  },
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  users: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
  lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
});

module.exports = mongoose.model("Channel", ChannelSchema);
