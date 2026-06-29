const express = require('express');
const chatService = require('../services/chat.service');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    const { reply } = await chatService.chat(message, history);
    res.json({ success: true, reply });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server xử lý chat.' });
  }
});

module.exports = router;
