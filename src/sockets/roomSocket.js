const Room = require("../models/Room");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // -------------------------------
    // JOIN ROOM
    // -------------------------------
    socket.on("join_room", async ({ code }) => {
      try {
        console.log(`Join request from ${socket.id} for room ${code}`);

        if (!code) {
          socket.emit("error", "Room code is required");
          return;
        }

        const room = await Room.findOne({ code });

        if (!room) {
          socket.emit("error", "Room not found");
          return;
        }

        if (Date.now() > new Date(room.expiresAt).getTime()) {
          socket.emit("error", "Room expired");
          return;
        }

        if (room.users.length >= 10) {
          socket.emit("error", "Room is full");
          return;
        }

        // ✅ Join socket room FIRST
        socket.join(code);

        // ✅ Attach room to socket (CRITICAL)
        socket.roomCode = code;

        // ✅ Prevent duplicate users
        if (!room.users.includes(socket.id)) {
          room.users.push(socket.id);
          await room.save();
        }

        console.log(`User ${socket.id} joined room ${code}`);

        // ✅ CONFIRM JOIN (IMPORTANT for frontend)
        socket.emit("joined_room", { code });

        // Notify others
        socket.to(code).emit("user_joined", {
          userId: socket.id
        });

      } catch (error) {
        console.error("Join room error:", error);
      }
    });

    // -------------------------------
    // SEND TEXT
    // -------------------------------
    socket.on("send_text", async ({ content }) => {
      try {
        const code = socket.roomCode;

        if (!code) {
          console.log("❌ No room attached to socket");
          return;
        }

        console.log("TEXT RECEIVED:", content);

        if (!content || content.trim() === "") return;

        const room = await Room.findOne({ code });

        if (!room) {
          console.log("Room not found");
          return;
        }

        if (Date.now() > new Date(room.expiresAt).getTime()) {
          socket.emit("error", "Room expired");
          return;
        }

        const newFile = {
          type: "text",
          content,
          uploadedBy: socket.id,
          createdAt: new Date()
        };

        // Save in DB
        room.files.push(newFile);
        await room.save();

        console.log(`Broadcasting text to room ${code}`);

        io.to(code).emit("new_text", newFile);

      } catch (error) {
        console.error("Text send error:", error);
      }
    });

    // -------------------------------
    // SEND FILE
    // -------------------------------
    socket.on("send_file", async ({ fileUrl, filename }) => {
      try {
        const code = socket.roomCode;

        if (!code) {
          console.log("❌ No room attached to socket");
          return;
        }

        const room = await Room.findOne({ code });

        if (!room) {
          console.log("Room not found");
          return;
        }

        if (Date.now() > new Date(room.expiresAt).getTime()) {
          socket.emit("error", "Room expired");
          return;
        }

        const newFile = {
          type: "file",
          url: fileUrl,
          filename,
          uploadedBy: socket.id,
          createdAt: new Date()
        };

        room.files.push(newFile);
        await room.save();

        console.log(`File shared in room ${code}`);

        io.to(code).emit("new_file", newFile);

      } catch (error) {
        console.error("File send error:", error);
      }
    });

    // -------------------------------
    // DISCONNECT
    // -------------------------------
    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);

      try {
        await Room.updateMany(
          {},
          { $pull: { users: socket.id } }
        );
      } catch (error) {
        console.error("Disconnect cleanup error:", error);
      }
    });
  });
};