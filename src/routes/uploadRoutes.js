const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

router.post("/", upload.single("file"), (req, res) => {
  try {
    res.json({
      success: true,
      fileUrl: req.file.path,
      filename: req.file.originalname
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;