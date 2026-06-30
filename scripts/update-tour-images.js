require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { connectDB, disconnectDB } = require('../src/db');
const { Tour } = require('../src/models');

const UPDATES = [
  { slug: 'da-nang-hoi-an-3n2d', mainImageUrl: '/uploads/1.png' },
  { slug: 'ha-noi-ha-long-4n3d', mainImageUrl: '/uploads/3.png' },
  { slug: 'kham-pha-quang-binh-phong-nha-ke-bang-3n2d', mainImageUrl: '/uploads/4.png' },
];

(async () => {
  await connectDB();
  for (const { slug, mainImageUrl } of UPDATES) {
    const result = await Tour.updateOne({ slug }, { $set: { mainImageUrl } });
    console.log(`${slug}: ${result.modifiedCount} updated → ${mainImageUrl}`);
  }
  await disconnectDB();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
