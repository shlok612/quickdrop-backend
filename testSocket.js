const { io } = require("socket.io-client");

// 🔥 Replace with your latest room code
const ROOM_CODE = "D55074";

// 🔥 Paste your Cloudinary URL from Postman
const FILE_URL = "https://res.cloudinary.com/dlrgubxt7/image/upload/v1777593833/quickdrop/ypdd7mgjmjs2gr31mifk.jpg";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  // Step 1: Join room
  socket.emit("join_room", { code: ROOM_CODE });
});

// ✅ Step 2: Wait for confirmation (IMPORTANT)
socket.on("joined_room", (data) => {
  console.log("Joined room successfully:", data);

  // Send text
  socket.emit("send_text", {
    content: "Hello 🚀🔥 こんにちは नमस्ते console.log('Hi');"
  });

  // Send file
  socket.emit("send_file", {
    fileUrl: FILE_URL,
    filename: "test-upload.jpg"
  });
});

// Receive text
socket.on("new_text", (data) => {
  console.log("New text received:", data);
});

// Receive file
socket.on("new_file", (data) => {
  console.log("New file received:", data);
});

// Other user joined
socket.on("user_joined", (data) => {
  console.log("Another user joined:", data);
});

// Errors
socket.on("error", (msg) => {
  console.log("Error:", msg);
});