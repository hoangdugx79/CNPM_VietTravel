const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const config = require('../config');
const { connectDB } = require('../db');
const { User } = require('../models');
const { mapUser } = require('../db/mapper');
const { ADMIN_ROLES } = require('../constants');

const googleClient = config.google.clientId && config.google.clientSecret
  ? new OAuth2Client(config.google.clientId, config.google.clientSecret, 'postmessage')
  : null;

function signUserToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn },
  );
}

function isAdminRole(role) {
  return ADMIN_ROLES.includes(role);
}

function isConfiguredAdminEmail(email) {
  return config.admin.emails.includes(email);
}

function normalizeOptionalString(value) {
  if (typeof value !== 'string') return undefined;
  const cleaned = value.trim();
  return cleaned || undefined;
}

async function loginWithGoogle(code) {
  if (!googleClient) {
    return { error: { status: 500, message: 'Google auth chua duoc cau hinh tren server.' } };
  }

  const { tokens } = await googleClient.getToken(code);
  if (!tokens?.id_token) {
    return { error: { status: 401, message: 'Khong lay duoc id token tu Google.' } };
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: config.google.clientId,
  });
  const payload = ticket.getPayload();

  if (!payload?.email || !payload.email_verified) {
    return { error: { status: 403, message: 'Tai khoan Google chua xac minh email.' } };
  }

  const email = payload.email.toLowerCase().trim();
  const shouldBeAdmin = isConfiguredAdminEmail(email);

  await connectDB();

  let user = await User.findOne({
    $or: [
      { googleId: payload.sub },
      { email },
    ],
  });

  if (!user) {
    user = await User.create({
      fullName: payload.name || email.split('@')[0],
      email,
      googleId: payload.sub,
      phone: undefined,
      authProvider: 'google',
      avatarUrl: payload.picture,
      role: shouldBeAdmin ? 'admin' : 'customer',
      status: 'active',
      lastLoginAt: new Date(),
    });
  } else {
    if (user.status !== 'active') {
      return { error: { status: 403, message: 'Tai khoan da bi khoa.' } };
    }

    user.fullName = user.fullName || payload.name || email.split('@')[0];
    user.email = email;
    user.googleId = payload.sub;
    user.phone = normalizeOptionalString(user.phone);
    user.authProvider = 'google';
    user.avatarUrl = payload.picture || user.avatarUrl;
    if (shouldBeAdmin && user.role !== 'admin') {
      user.role = 'admin';
    }
    user.lastLoginAt = new Date();
    await user.save();
  }

  const mappedUser = mapUser(user);
  return {
    token: signUserToken(user),
    user: mappedUser,
    adminEligible: isAdminRole(mappedUser.Role),
  };
}

async function getProfile(userId) {
  await connectDB();
  const user = await User.findById(userId).lean();
  return mapUser(user);
}

async function loginWithPassword(email, password) {
  await connectDB();
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return { error: { status: 401, message: 'Email hoặc mật khẩu không chính xác.' } };
  }
  if (user.status !== 'active') {
    return { error: { status: 403, message: 'Tài khoản đã bị khóa.' } };
  }
  if (!user.passwordHash) {
    return { error: { status: 400, message: 'Tài khoản này chưa cấu hình mật khẩu (đăng nhập bằng Google).' } };
  }
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return { error: { status: 401, message: 'Email hoặc mật khẩu không chính xác.' } };
  }
  const mappedUser = mapUser(user);
  return {
    token: signUserToken(user),
    user: mappedUser,
    adminEligible: isAdminRole(mappedUser.Role),
  };
}

module.exports = { loginWithGoogle, getProfile, isAdminRole, loginWithPassword };
