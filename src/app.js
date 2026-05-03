const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true
}));

app.use("/api/upload", require("./routes/uploadRoutes"));

app.use(express.json());

// Routes
app.use("/api/rooms", require("./routes/roomRoutes"));

app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;