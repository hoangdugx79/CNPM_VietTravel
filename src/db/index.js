const mongoose = require('mongoose');
const config = require('../config');

let isConnected = false;
let indexesEnsured = false;
let connectPromise = null;
let listenersBound = false;

function bindConnectionListeners() {
  if (listenersBound) {
    return;
  }

  mongoose.connection.on('connected', () => {
    isConnected = true;
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    indexesEnsured = false;
  });

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });

  listenersBound = true;
}

async function ensureUserIndexes() {
  if (indexesEnsured) {
    return;
  }

  const users = mongoose.connection.collection('users');

  // Older deployments created a strict unique phone index that also matched
  // Google-only users without a phone number. Normalize those documents first.
  await users.updateMany(
    { phone: null },
    { $unset: { phone: '' } },
  );

  let indexes = [];
  try {
    indexes = await users.indexes();
  } catch (error) {
    if (error.code !== 26 && error.codeName !== 'NamespaceNotFound') {
      throw error;
    }
  }
  const phoneIndex = indexes.find((index) => index.name === 'phone_1');
  const needsRebuild = !phoneIndex
    || !phoneIndex.unique
    || !phoneIndex.partialFilterExpression
    || phoneIndex.partialFilterExpression.phone?.$type !== 'string';

  if (needsRebuild && phoneIndex) {
    await users.dropIndex('phone_1');
  }

  if (needsRebuild) {
    await users.createIndex(
      { phone: 1 },
      {
        name: 'phone_1',
        unique: true,
        partialFilterExpression: { phone: { $type: 'string' } },
      },
    );
  }

  indexesEnsured = true;
}

async function connectDB() {
  bindConnectionListeners();

  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    await ensureUserIndexes();
    return mongoose.connection;
  }

  if (connectPromise) {
    return connectPromise;
  }

  connectPromise = mongoose.connect(config.mongo.uri)
    .then(async () => {
      await ensureUserIndexes();
      isConnected = true;
      console.log('Connected to MongoDB:', mongoose.connection.name);
      return mongoose.connection;
    })
    .finally(() => {
      connectPromise = null;
    });

  return connectPromise;
}

async function disconnectDB() {
  if (connectPromise) {
    await connectPromise;
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    indexesEnsured = false;
  }
}

module.exports = { connectDB, disconnectDB, mongoose };
