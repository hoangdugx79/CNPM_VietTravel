const express = require('express');
const promotionService = require('../../services/admin/promotion.service');

const router = express.Router();

function handleError(res, err) {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Loi server.',
  });
}

router.get('/lookups', async (req, res) => {
  try {
    const data = await promotionService.getLookups();
    res.json({ success: true, data });
  } catch (err) {
    handleError(res, err);
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await promotionService.listPromotions(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await promotionService.getPromotionById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Khuyen mai khong ton tai.' });
    res.json({ success: true, data });
  } catch (err) {
    handleError(res, err);
  }
});

router.post('/', async (req, res) => {
  try {
    const data = await promotionService.createPromotion(req.body);
    res.status(201).json({ success: true, message: 'Tao khuyen mai thanh cong.', data });
  } catch (err) {
    handleError(res, err);
  }
});

router.put('/:id', async (req, res) => {
  try {
    await promotionService.updatePromotion(req.params.id, req.body);
    res.json({ success: true, message: 'Cap nhat khuyen mai thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await promotionService.deletePromotion(req.params.id);
    res.json({ success: true, message: 'Luu tru khuyen mai thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});

router.post('/:id/tours', async (req, res) => {
  try {
    const { tourIds } = req.body;
    if (!Array.isArray(tourIds)) {
      return res.status(400).json({ success: false, message: 'Danh sach tour khong hop le.' });
    }
    await promotionService.assignTours(req.params.id, tourIds);
    res.json({ success: true, message: 'Gan tour vao khuyen mai thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});

router.delete('/:id/tours/:tourId', async (req, res) => {
  try {
    await promotionService.removeTour(req.params.id, req.params.tourId);
    res.json({ success: true, message: 'Go tour khoi khuyen mai thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
