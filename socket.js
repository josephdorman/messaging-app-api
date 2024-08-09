const User = require("./models/user");
const { Server } = require("socket.io");

const socketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  // "connection" activates when a user is simply on the website even the signup/login page
  io.on("connection", (socket) => {
    // when user logs into the app and not just on the signup/login page
    socket.on("user_online", (data) => {
      const setOnline = async (id) => {
        const user = await User.findById(id)
          .select("username profileIMG status friends")
          .populate("friends", "username profileIMG status");
        user.status = "online";
        user.save();

        socket.data = user;
        socket.join(user._id.toString());

        if (user.friends) {
          for (let i = 0; i < user.friends.length; i++) {
            const channelName = user.friends[i]._id.toString();
            io.to(channelName)
              .except(user._id.toString())
              .emit("friend_online");
          }
        }
      };

      setOnline(data._id);
    });

    socket.on("refresh_friends", (id) => {
      const getFriends = async (id) => {
        const userFriends = await User.findById(id, "friends").populate({
          path: "friends",
          select: "username profileIMG status",
          match: { status: "online" },
        });

        console.log(userFriends.friends);

        io.emit("get_friends", userFriends.friends);
      };

      getFriends(id);
    });

    socket.on("join_channels", (channels) => {
      if (channels) {
        channels.forEach((channel) => {
          socket.join(channel._id);
        });
      }
    });

    socket.on("send_message", (msg, channel, user) => {
      let testDate = new Date();
      const message = {
        body: msg,
        channel: channel._id,
        date: testDate.toISOString(),
        user: user,
        _id: Date.now(),
      };

      channel.messages.push(message);
      io.to(channel._id).emit("receive_message", channel);
      io.emit("receive_last_message", message);
    });

    socket.on("delete_channel", () => {
      io.emit("refresh_channels");
    });

    socket.on("user_offline", () => {
      const setOffline = async (id) => {
        const user = await User.findByIdAndUpdate(id, { status: "offline" });

        if (socket.data.friends) {
          for (let i = 0; i < socket.data.friends.length; i++) {
            const channelName = socket.data.friends[i]._id.toString();
            io.to(channelName)
              .except(user._id.toString())
              .emit("friend_offline");
          }
        }
      };

      setOffline(socket.data._id);
    });

    socket.on("disconnect", () => {
      const setOffline = async (id) => {
        const user = await User.findByIdAndUpdate(id, { status: "offline" });

        //console.log(socket.data);

        if (socket.data.friends) {
          for (let i = 0; i < socket.data.friends.length; i++) {
            const channelName = socket.data.friends[i]._id.toString();
            io.to(channelName)
              .except(user._id.toString())
              .emit("friend_offline");
          }
        }
      };

      setOffline(socket.data._id);
      // io.emit("receive_friends", onlineUsers);
      //console.log(`Leaving Rooms: ${socket.rooms}`);
      //console.log(
      //  `User Disconnected: ${socket.id} ${JSON.stringify(socket.data)})}`
      //);
    });
  });
};

module.exports = socketServer;
