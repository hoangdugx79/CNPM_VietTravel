const express = require('express');
const dashboardService = require('../../services/admin/dashboard.service');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await dashboardService.getDashboardData();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

module.exports = router;
