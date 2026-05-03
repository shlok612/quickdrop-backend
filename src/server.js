require("dotenv").config();

const http = require("http");
const app = require("./app");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
console.log("Connecting to MongoDB...");
connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://quickdrop-frontend-6mlu.vercel.app"
    ],
    methods: ["GET", "POST"]
  }
});

require("./sockets/roomSocket")(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});