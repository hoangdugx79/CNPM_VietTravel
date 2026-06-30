const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB, disconnectDB } = require('../src/db');
const { User } = require('../src/models');

async function run() {
  await connectDB();
  const email = 'binh26122006@gmail.com';
  const fullName = 'Thành Huy';
  const password = '1';
  const passwordHash = await bcrypt.hash(password, 10);

  let user = await User.findOne({ email: email.toLowerCase().trim() });
  if (user) {
    user.role = 'admin';
    user.fullName = fullName;
    user.authProvider = 'local';
    user.passwordHash = passwordHash;
    user.status = 'active';
    await user.save();
    console.log(`Updated user ${email} to admin with password.`);
  } else {
    await User.create({
      fullName,
      email: email.toLowerCase().trim(),
      authProvider: 'local',
      passwordHash,
      role: 'admin',
      status: 'active'
    });
    console.log(`Created admin user ${email} with password.`);
  }

  await disconnectDB();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
