require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { connectDB, disconnectDB } = require('../src/db');
const { Tour, Destination } = require('../src/models');
const { convertAllUploads, migrateDbImageUrls } = require('./lib/convert-webp');

(async () => {
  console.log('Converting all PNG/JPG in uploads/ to WebP...\n');
  await convertAllUploads();

  await connectDB();
  const { tourCount, destCount } = await migrateDbImageUrls(Tour, Destination);
  console.log(`\nDB migrated: ${tourCount} tours, ${destCount} destinations`);
  await disconnectDB();
  console.log('Done.');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
