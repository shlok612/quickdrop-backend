const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  type: {
    type: String, // "text" or "file"
    required: true
  },
  content: String, // for text/code
  url: String,     // for file/image
  filename: String,
  uploadedBy: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const roomSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number,
    required: true,
    default: 5
  },
  expiresAt: {
    type: Date,
    required: true
  },
  users: [
    {
      type: String
    }
  ],
  files: [fileSchema]
});

roomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Room", roomSchema);