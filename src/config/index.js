require('dotenv').config();

const adminEmails = [
  process.env.ADMIN_EMAIL_1,
  process.env.ADMIN_EMAIL_2,
  process.env.ADMIN_EMAIL_3,
]
  .map((email) => email?.toLowerCase().trim())
  .filter(Boolean);

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://viettravel.brandgens.com',
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/traveltourdb',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  admin: {
    emails: adminEmails,
  },
};
