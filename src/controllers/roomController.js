const Room = require("../models/Room");
const generateCode = require("../utils/generateCode");

const ALLOWED_DURATIONS = new Set([5, 10, 30, 60]);

exports.createRoom = async (req, res) => {
  try {
    const requestedDuration = Number(req.body?.duration);
    const duration = ALLOWED_DURATIONS.has(requestedDuration) ? requestedDuration : 5;

    let code;
    let exists = true;

    // Ensure unique room code
    while (exists) {
      code = generateCode();
      const room = await Room.findOne({ code });
      if (!room) exists = false;
    }

    const now = Date.now();
    const expiresAt = new Date(now + duration * 60 * 1000);

    const newRoom = await Room.create({
      code,
      duration,
      expiresAt,
      users: [],
      files: []
    });

    res.status(201).json({
      success: true,
      code: newRoom.code,
      duration: newRoom.duration,
      expiresAt: newRoom.expiresAt
    });

  } catch (error) {
    console.error("Create Room Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Room code is required"
      });
    }

    const room = await Room.findOne({ code });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    if (Date.now() > new Date(room.expiresAt).getTime()) {
      return res.status(410).json({
        success: false,
        message: "Room expired"
      });
    }

    if (room.users.length >= 10) {
      return res.status(400).json({
        success: false,
        message: "Room is full"
      });
    }

    res.status(200).json({
      success: true,
      files: room.files,
      duration: room.duration,
      expiresAt: room.expiresAt
    });

  } catch (error) {
    console.error("Join Room Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};