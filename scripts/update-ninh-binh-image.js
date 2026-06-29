require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { connectDB, disconnectDB } = require('../src/db');
const { Tour, Destination } = require('../src/models');

const IMAGE = '/uploads/2.png';

(async () => {
  await connectDB();
  const tour = await Tour.updateOne(
    { slug: 'ha-noi-ninh-binh-trang-an' },
    { $set: { mainImageUrl: IMAGE } },
  );
  const dest = await Destination.updateOne(
    { slug: 'ninh-binh' },
    { $set: { imageUrl: IMAGE } },
  );
  console.log('Tour updated:', tour.modifiedCount);
  console.log('Destination updated:', dest.modifiedCount);
  await disconnectDB();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
