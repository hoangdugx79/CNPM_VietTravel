const mongoose = require('mongoose');
const config = require('../config');

let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  await mongoose.connect(config.mongo.uri);
  isConnected = true;
  console.log('✅ Connected to MongoDB:', mongoose.connection.name);
  return mongoose.connection;
}

async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
}

module.exports = { connectDB, disconnectDB, mongoose };
