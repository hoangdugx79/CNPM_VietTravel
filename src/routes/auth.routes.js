const express = require('express');
const authService = require('../services/auth.service');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Thiếu email hoặc mật khẩu.' });
    }
    const result = await authService.loginWithPassword(email, password);
    if (result.error) {
      return res.status(result.error.status).json({ success: false, message: result.error.message });
    }
    res.json({
      success: true,
      message: 'Đăng nhập thành công.',
      token: result.token,
      user: result.user,
      adminEligible: result.adminEligible,
    });
  } catch (err) {
    console.error('Password login error:', err);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi đăng nhập.' });
  }
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
    res.status(500).json({ success: false, message: 'Không thể đăng ký bằng Google lúc này.' });
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
    res.status(500).json({ success: false, message: 'Không thể đăng nhập bằng Google lúc này.' });
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
