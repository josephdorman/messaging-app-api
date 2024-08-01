const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, require: true },
  password: { type: String, require: true },
  email: { type: String, require: true },
  profileIMG: { type: String, default: "defaultProfile.jpg" },
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  friendRequests: {
    sent: [{ type: Schema.Types.ObjectId, ref: "User" }],
    received: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  channelRequests: {
    sent: [
      {
        user: { type: Schema.Types.ObjectID, ref: "User" },
        channel: { type: Schema.Types.ObjectID, ref: "Channel" },
      },
    ],
    received: [
      {
        user: { type: Schema.Types.ObjectID, ref: "User" },
        channel: { type: Schema.Types.ObjectID, ref: "Channel" },
      },
    ],
  },
  notifications: [{ type: Schema.Types.ObjectId, ref: "Notification" }],
  blocked: [{ type: Schema.Types.ObjectId, ref: "User" }],
  channels: [{ type: Schema.Types.ObjectId, ref: "Channel" }],
  messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
});

module.exports = mongoose.model("User", UserSchema);
