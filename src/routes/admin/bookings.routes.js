const express = require('express');
const bookingService = require('../../services/admin/booking.service');

const router = express.Router();

function handleError(res, err) {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Loi server.',
  });
}

router.get('/', async (req, res) => {
  try {
    const result = await bookingService.listBookings(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await bookingService.getBookingById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Khong tim thay booking.' });
    res.json({ success: true, data });
  } catch (err) {
    handleError(res, err);
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    await bookingService.updateStatus(req.params.id, req.body.status);
    res.json({ success: true, message: 'Cap nhat trang thai booking thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});

router.put('/:id/confirm', async (req, res) => {
  try {
    await bookingService.confirmBooking(req.params.id);
    res.json({ success: true, message: 'Xac nhan booking thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});

router.put('/:id/cancel', async (req, res) => {
  try {
    await bookingService.cancelBooking(req.params.id);
    res.json({ success: true, message: 'Huy booking thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
