const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../src/db');
const { User } = require('../src/models');

async function run() {
  await connectDB();
  const email = 'binh26122006@gmail.com';
  const fullName = 'Thành Huy';

  let user = await User.findOne({ email: email.toLowerCase().trim() });
  if (user) {
    user.role = 'admin';
    user.fullName = fullName;
    user.authProvider = 'google';
    user.status = 'active';
    await user.save();
    console.log(`Updated user ${email} to admin.`);
  } else {
    await User.create({
      fullName,
      email: email.toLowerCase().trim(),
      authProvider: 'google',
      role: 'admin',
      status: 'active'
    });
    console.log(`Created admin user ${email}.`);
  }

  await disconnectDB();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
