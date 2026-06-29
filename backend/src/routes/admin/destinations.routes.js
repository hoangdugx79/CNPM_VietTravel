const express = require('express');
const destinationService = require('../../services/admin/destination.service');

const router = express.Router();

function handleError(res, err) {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Loi server.',
  });
}

router.get('/', async (req, res) => {
  try {
    const result = await destinationService.listDestinations(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
});

router.post('/', async (req, res) => {
  try {
    const data = await destinationService.createDestination(req.body);
    res.status(201).json({ success: true, message: 'Them diem den thanh cong.', data });
  } catch (err) {
    handleError(res, err);
  }
});

router.put('/:id', async (req, res) => {
  try {
    await destinationService.updateDestination(req.params.id, req.body);
    res.json({ success: true, message: 'Cap nhat diem den thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await destinationService.deleteDestination(req.params.id);
    res.json({ success: true, message: 'Xoa diem den thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
