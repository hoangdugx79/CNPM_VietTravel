const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const { ADMIN_ROLES } = require('../constants');

const authRoutes = require('./auth.routes');
const tourRoutes = require('./tours.routes');
const bookingRoutes = require('./bookings.routes');
const { destinationsRouter, categoriesRouter } = require('./destinations.routes');
const chatRoutes = require('./chat.routes');

const adminDashboard = require('./admin/dashboard.routes');
const adminTours = require('./admin/tours.routes');
const adminBookings = require('./admin/bookings.routes');
const adminTransport = require('./admin/transport.routes');
const adminUsers = require('./admin/users.routes');
const adminPromotions = require('./admin/promotions.routes');
const adminDestinations = require('./admin/destinations.routes');

function registerRoutes(app) {
  app.use('/api/auth', authRoutes);
  app.use('/api/tours', tourRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/destinations', destinationsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/chat', chatRoutes);

  const adminMiddleware = [auth, requireRole(...ADMIN_ROLES)];
  app.use('/api/admin/dashboard', adminMiddleware, adminDashboard);
  app.use('/api/admin/tours', adminMiddleware, adminTours);
  app.use('/api/admin/bookings', adminMiddleware, adminBookings);
  app.use('/api/admin/transport', adminMiddleware, adminTransport);
  app.use('/api/admin/users', adminMiddleware, adminUsers);
  app.use('/api/admin/promotions', adminMiddleware, adminPromotions);
  app.use('/api/admin/destinations', adminMiddleware, adminDestinations);
}

module.exports = { registerRoutes };
