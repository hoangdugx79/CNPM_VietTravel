const express = require('express');
const tourService = require('../services/tour.service');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await tourService.getTours(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Get tours error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const data = await tourService.getFeaturedTours();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const data = await tourService.getTourBySlug(req.params.slug);
    if (!data) return res.status(404).json({ success: false, message: 'Tour không tồn tại.' });
    res.json({ success: true, data });
  } catch (err) {
    console.error('Get tour detail error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

router.get('/:tourId/transport/:departureId', async (req, res) => {
  try {
    const data = await tourService.getTransportOptions(req.params.tourId, req.params.departureId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

module.exports = router;
