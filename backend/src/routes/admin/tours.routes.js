const express = require('express');
const tourService = require('../../services/admin/tour.service');

const router = express.Router();

function handleError(res, err) {
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Loi server.',
  });
}

router.get('/lookups', async (req, res) => {
  try {
    const data = await tourService.getLookups();
    res.json({ success: true, data });
  } catch (err) {
    handleError(res, err);
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await tourService.listTours(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
});

router.get('/all-departures', async (req, res) => {
  try {
    const result = await tourService.listAllDepartures(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
});

router.put('/departures/:id', async (req, res) => {
  try {
    await tourService.updateDeparture(req.params.id, req.body);
    res.json({ success: true, message: 'Cap nhat lich khoi hanh thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});

router.delete('/departures/:id', async (req, res) => {
  try {
    await tourService.deleteDeparture(req.params.id);
    res.json({ success: true, message: 'Xoa lich khoi hanh thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});

router.put('/itineraries/:id', async (req, res) => {
  try {
    await tourService.updateItinerary(req.params.id, req.body);
    res.json({ success: true, message: 'Cap nhat lich trinh thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});

router.delete('/itineraries/:id', async (req, res) => {
  try {
    await tourService.deleteItinerary(req.params.id);
    res.json({ success: true, message: 'Xoa lich trinh thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await tourService.getTourById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Tour khong ton tai.' });
    }
    res.json({ success: true, data });
  } catch (err) {
    handleError(res, err);
  }
});

router.post('/', async (req, res) => {
  try {
    const data = await tourService.createTour(req.body, req.user?.UserId);
    res.status(201).json({ success: true, message: 'Tao tour thanh cong.', data });
  } catch (err) {
    handleError(res, err);
  }
});

router.put('/:id', async (req, res) => {
  try {
    await tourService.updateTour(req.params.id, req.body);
    res.json({ success: true, message: 'Cap nhat tour thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await tourService.deleteTour(req.params.id);
    res.json({ success: true, message: 'Luu tru tour thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});

router.get('/:id/departures', async (req, res) => {
  try {
    const data = await tourService.getDepartures(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    handleError(res, err);
  }
});

router.post('/:id/departures', async (req, res) => {
  try {
    await tourService.createDeparture(req.params.id, req.body);
    res.status(201).json({ success: true, message: 'Them lich khoi hanh thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});

router.post('/:id/itineraries', async (req, res) => {
  try {
    await tourService.createItinerary(req.params.id, req.body);
    res.status(201).json({ success: true, message: 'Them lich trinh thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
