require('dotenv').config();
const express = require('express');
const next = require('next');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const config = require('./src/config');
const { registerRoutes } = require('./src/routes');
const { connectDB } = require('./src/db');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev, dir: __dirname });
const handle = nextApp.getRequestHandler();

function queryString(req) {
  return req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
}

function legacyRedirect(req, res, nextHandler) {
  const qs = queryString(req);

  const pageMap = {
    '/pages/tours.html': '/tours',
    '/pages/login.html': '/login',
    '/pages/register.html': '/register',
    '/pages/my-bookings.html': '/my-bookings',
    '/pages/booking-detail.html': '/my-bookings',
    '/index.html': '/',
    '/admin/index.html': '/admin',
    '/admin/login.html': '/admin/login',
  };

  if (pageMap[req.path]) {
    return res.redirect(301, pageMap[req.path] + qs);
  }

  if (req.path === '/pages/tour-detail.html') {
    const slug = new URL(req.url, 'http://localhost').searchParams.get('slug');
    return res.redirect(301, slug ? `/tours/${slug}` : '/tours');
  }

  if (req.path.startsWith('/admin/pages/') && req.path.endsWith('.html')) {
    const page = req.path.slice('/admin/pages/'.length, -'.html'.length);
    return res.redirect(301, `/admin/${page}${qs}`);
  }

  if (req.path.startsWith('/pages/') && req.path.endsWith('.html')) {
    return res.redirect(301, `/tours${qs}`);
  }

  return nextHandler();
}

nextApp.prepare().then(async () => {
  await connectDB();

  const app = express();

  app.use(cors({ origin: '*', credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  app.use(legacyRedirect);

  registerRoutes(app);

  app.use((req, res, nextHandler) => {
    handle(req, res).catch(nextHandler);
  });

  app.use((err, req, res, nextHandler) => {
    console.error('Unhandled error:', err);
    if (res.headersSent) return nextHandler(err);
    res.status(500).json({ success: false, message: 'Lỗi server nội bộ.' });
  });

  const server = app.listen(config.port, () => {
    const port = server.address().port;
    console.log(`
╔════════════════════════════════════════════╗
║   🌏 Travel Tour System - Server Started   ║
╠════════════════════════════════════════════╣
║  Port     : ${port}                                  ║
║  Frontend : http://localhost:${port}                ║
║  Tours    : http://localhost:${port}/tours          ║
║  Admin    : http://localhost:${port}/admin          ║
║  API      : http://localhost:${port}/api            ║
╚════════════════════════════════════════════╝
    `);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${config.port} đang được dùng. Dừng process cũ hoặc đổi PORT trong .env`);
    } else {
      console.error('❌ Server error:', err.message);
    }
    process.exit(1);
  });
}).catch((err) => {
  console.error('Next.js prepare error:', err);
  process.exit(1);
});
