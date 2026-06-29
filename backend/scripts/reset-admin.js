require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { connectDB, disconnectDB } = require('../src/db');
const { User } = require('../src/models');

async function run() {
  await connectDB();
  const adminHash = await bcrypt.hash('Admin@123456', 10);
  const customerHash = await bcrypt.hash('Customer@123', 10);
  await User.updateMany({ role: { $in: ['admin', 'staff'] } }, { passwordHash: adminHash });
  await User.updateMany({ role: 'customer' }, { passwordHash: customerHash });
  console.log('✅ Reset passwords: Admin@123456, Customer@123');
  await disconnectDB();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
