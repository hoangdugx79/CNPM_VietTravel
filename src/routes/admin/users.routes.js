const express = require('express');
const userService = require('../../services/admin/user.service');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await userService.listUsers(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await userService.getUserById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Nguoi dung khong ton tai.' });
    }
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { fullName, email } = req.body;
    if (!fullName || !email) {
      return res.status(400).json({ success: false, message: 'Thieu thong tin bat buoc.' });
    }
    const result = await userService.createUser(req.body);
    if (result?.error) {
      return res.status(result.error.status).json({ success: false, message: result.error.message });
    }
    res.status(201).json({ success: true, message: 'Them nguoi dung thanh cong.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    await userService.updateUser(req.params.id, req.body);
    res.json({ success: true, message: 'Cap nhat nguoi dung thanh cong.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id/reset-password', async (req, res) => {
  res.status(410).json({ success: false, message: 'He thong chi ho tro dang nhap bang Google.' });
});

router.delete('/:id', async (req, res) => {
  try {
    await userService.blockUser(req.params.id);
    res.json({ success: true, message: 'Da khoa tai khoan.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
