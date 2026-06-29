const express = require('express');
const transportService = require('../../services/admin/transport.service');

const router = express.Router();

function handleError(res, err) {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Loi server.',
  });
}

router.get('/lookups', async (req, res) => {
  try {
    const data = await transportService.getLookups();
    res.json({ success: true, data });
  } catch (err) {
    handleError(res, err);
  }
});

router.get('/providers', async (req, res) => {
  try {
    const result = await transportService.listProviders(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
});
router.post('/providers', async (req, res) => {
  try {
    await transportService.createProvider(req.body);
    res.status(201).json({ success: true, message: 'Them nha cung cap thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});
router.put('/providers/:id', async (req, res) => {
  try {
    await transportService.updateProvider(req.params.id, req.body);
    res.json({ success: true, message: 'Cap nhat nha cung cap thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});
router.delete('/providers/:id', async (req, res) => {
  try {
    await transportService.deleteProvider(req.params.id);
    res.json({ success: true, message: 'Luu tru nha cung cap thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});

router.get('/vehicles', async (req, res) => {
  try {
    const result = await transportService.listVehicles(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
});
router.post('/vehicles', async (req, res) => {
  try {
    await transportService.createVehicle(req.body);
    res.status(201).json({ success: true, message: 'Them xe thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});
router.put('/vehicles/:id', async (req, res) => {
  try {
    await transportService.updateVehicle(req.params.id, req.body);
    res.json({ success: true, message: 'Cap nhat xe thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});
router.delete('/vehicles/:id', async (req, res) => {
  try {
    await transportService.deleteVehicle(req.params.id);
    res.json({ success: true, message: 'Luu tru xe thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});

router.get('/drivers', async (req, res) => {
  try {
    const result = await transportService.listDrivers(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
});
router.post('/drivers', async (req, res) => {
  try {
    await transportService.createDriver(req.body);
    res.status(201).json({ success: true, message: 'Them tai xe thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});
router.put('/drivers/:id', async (req, res) => {
  try {
    await transportService.updateDriver(req.params.id, req.body);
    res.json({ success: true, message: 'Cap nhat tai xe thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});
router.delete('/drivers/:id', async (req, res) => {
  try {
    await transportService.deleteDriver(req.params.id);
    res.json({ success: true, message: 'Luu tru tai xe thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});

router.get('/routes', async (req, res) => {
  try {
    const result = await transportService.listRoutes(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
});
router.get('/routes/:id/pickups', async (req, res) => {
  try {
    const data = await transportService.getRoutePickups(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    handleError(res, err);
  }
});
router.post('/routes', async (req, res) => {
  try {
    await transportService.createRoute(req.body);
    res.status(201).json({ success: true, message: 'Them tuyen duong thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});
router.put('/routes/:id', async (req, res) => {
  try {
    await transportService.updateRoute(req.params.id, req.body);
    res.json({ success: true, message: 'Cap nhat tuyen duong thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});
router.delete('/routes/:id', async (req, res) => {
  try {
    await transportService.deleteRoute(req.params.id);
    res.json({ success: true, message: 'Luu tru tuyen duong thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});
router.post('/routes/:id/pickups', async (req, res) => {
  try {
    await transportService.createPickupPoint(req.params.id, req.body);
    res.status(201).json({ success: true, message: 'Them diem don thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});
router.put('/pickups/:id', async (req, res) => {
  try {
    await transportService.updatePickupPoint(req.params.id, req.body);
    res.json({ success: true, message: 'Cap nhat diem don thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});
router.delete('/pickups/:id', async (req, res) => {
  try {
    await transportService.deletePickupPoint(req.params.id);
    res.json({ success: true, message: 'Xoa diem don thanh cong.' });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
