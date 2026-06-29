const express = require('express');
const destinationService = require('../services/destination.service');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await destinationService.getDestinations();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

const categoriesRouter = express.Router();
categoriesRouter.get('/', async (req, res) => {
  try {
    const data = await destinationService.getCategories();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

module.exports = { destinationsRouter: router, categoriesRouter };
