const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const config = require('../config');
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
  const user = await User.findById(userId).lean();
  return mapUser(user);
}

module.exports = { loginWithGoogle, getProfile, isAdminRole };
