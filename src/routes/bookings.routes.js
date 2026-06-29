const express = require('express');
const bookingService = require('../services/booking.service');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { departureId, adultQuantity } = req.body;
    if (!departureId || adultQuantity == null) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin đặt tour.' });
    }
    const booking = await bookingService.createBooking(req.user, req.body);
    res.status(201).json({ success: true, message: 'Đặt tour thành công!', data: booking });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ success: false, message: err.message || 'Lỗi server.' });
  }
});

router.get('/active-promotions', async (req, res) => {
  try {
    const data = await bookingService.getActivePromotions();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const result = await bookingService.getMyBookings(req.user.UserId, req.query.page, req.query.limit);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

router.get('/:code', auth, async (req, res) => {
  try {
    const data = await bookingService.getBookingByCode(req.params.code, req.user.UserId);
    if (!data) return res.status(404).json({ success: false, message: 'Booking không tồn tại.' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

router.post('/:id/pay', auth, async (req, res) => {
  try {
    const { amount, method, note } = req.body;
    if (!amount || !method) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin thanh toán.' });
    }
    const data = await bookingService.payBooking(req.params.id, { amount, method, note });
    res.json({ success: true, message: 'Thanh toán thành công!', data });
  } catch (err) {
    console.error('Pay booking error:', err);
    res.status(500).json({ success: false, message: err.message || 'Lỗi server.' });
  }
});

router.post('/check-promo', auth, async (req, res) => {
  try {
    const { code, amount } = req.body;
    const result = await bookingService.checkPromo(code, amount);
    if (result.error) return res.status(result.error.status).json({ success: false, message: result.error.message });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

module.exports = router;
