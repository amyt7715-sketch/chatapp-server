const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Message = require('../models/Message');

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Get messages between two users
router.get('/:senderId/:receiverId', async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send text message
router.post('/send', async (req, res) => {
  try {
    const { senderId, receiverId, content, type, location } = req.body;
    const message = new Message({ senderId, receiverId, content, type, location });
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send file/image
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { senderId, receiverId, type } = req.body;
    const fileUrl = '/uploads/' + req.file.filename;
    const message = new Message({ senderId, receiverId, type, fileUrl });
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;