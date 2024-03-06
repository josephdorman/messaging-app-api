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

    socket.on("disconnect", () => {
      onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);

      io.emit("receive_friends", onlineUsers);
      console.log(`User Disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketServer;
