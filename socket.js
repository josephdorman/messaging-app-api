const { Server } = require("socket.io");

const socketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  let onlineUsers = [];

  io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("user_online", (data) => {
      if (!onlineUsers.some((user) => user.userId === data.id)) {
        onlineUsers.push({ userId: data.id, socketId: socket.id });
      }

      io.emit("receive_friends", onlineUsers);
    });

    socket.on("get_friends", () => {
      io.emit("receive_friends", onlineUsers);
    });

    socket.on("join_channels", (channels) => {
      if (channels) {
        channels.forEach((channel) => {
          console.log("joining channel", channel._id);
          socket.join(channel._id);
        });
      }
    });

    socket.on("send_message", (msg, channel, user) => {
      const message = {
        body: msg,
        channel: channel._id,
        date: Date.now(),
        user: user,
        _id: Date.now(),
      };

      channel.messages.push(message);
      io.to(channel._id).emit("receive_message", channel);
      io.emit("receive_last_message", message);
    });

    socket.on("disconnect", () => {
      onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);

      io.emit("receive_friends", onlineUsers);
      console.log(`Leaving Rooms: ${socket.rooms}`);
      console.log(`User Disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketServer;
