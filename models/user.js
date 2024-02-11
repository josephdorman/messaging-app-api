const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, require: true },
  password: { type: String, require: true },
  email: { type: String, require: true },
  profileIMG: { type: String, default: "defaultProfile.jpg" },
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  channels: [{ type: Schema.Types.ObjectId, ref: "Channel" }],
  messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
});

module.exports = mongoose.model("User", UserSchema);
