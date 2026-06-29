const express = require('express');
const authService = require('../services/auth.service');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  res.status(410).json({ success: false, message: 'He thong chi ho tro dang nhap bang Google.' });
});

router.post('/register', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Thieu ma xac thuc Google.' });
    }

    const result = await authService.loginWithGoogle(code);
    if (result.error) {
      return res.status(result.error.status).json({ success: false, message: result.error.message });
    }

    res.status(201).json({
      success: true,
      message: 'Dang ky thanh cong.',
      token: result.token,
      user: result.user,
      adminEligible: result.adminEligible,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Loi server.' });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Thieu ma xac thuc Google.' });
    }

    const result = await authService.loginWithGoogle(code);
    if (result.error) {
      return res.status(result.error.status).json({ success: false, message: result.error.message });
    }

    res.json({
      success: true,
      message: 'Dang nhap thanh cong.',
      token: result.token,
      user: result.user,
      adminEligible: result.adminEligible,
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ success: false, message: 'Loi server.' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.UserId);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Loi server.' });
  }
});

router.put('/change-password', auth, async (req, res) => {
  res.status(410).json({ success: false, message: 'He thong chi ho tro dang nhap bang Google.' });
});

module.exports = router;
