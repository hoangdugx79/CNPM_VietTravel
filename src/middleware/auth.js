const jwt = require('jsonwebtoken');
const config = require('../config');
const { connectDB } = require('../db');
const { User } = require('../models');
const { mapUser } = require('../db/mapper');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Không có token xác thực.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);
    await connectDB();
    const user = await User.findOne({ _id: decoded.userId, status: 'active' }).lean();

    if (!user) {
      return res.status(401).json({ success: false, message: 'Tài khoản không hợp lệ hoặc bị khóa.' });
    }

    req.user = mapUser(user);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token đã hết hạn.' });
    }
    return res.status(401).json({ success: false, message: 'Token không hợp lệ.' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Chưa đăng nhập.' });
  if (!roles.includes(req.user.Role)) {
    return res.status(403).json({ success: false, message: 'Không có quyền truy cập.' });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.secret);
      await connectDB();
      const user = await User.findOne({ _id: decoded.userId, status: 'active' }).lean();
      if (user) req.user = mapUser(user);
    }
  } catch (e) {
    // ignore
  }
  next();
};

module.exports = { auth, requireRole, optionalAuth };
