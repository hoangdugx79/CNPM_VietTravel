require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { connectDB, disconnectDB } = require('../src/db');
const { Tour, TourDeparture, Destination, TourCategory, User } = require('../src/models');
const { convertUploadToWebp, migrateDbImageUrls } = require('./lib/convert-webp');

const future = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

(async () => {
  await convertUploadToWebp('5.png');

  await connectDB();

  let hue = await Destination.findOne({ slug: 'hue' });
  if (!hue) {
    hue = await Destination.create({
      name: 'Huế',
      slug: 'hue',
      province: 'Thừa Thiên Huế',
      country: 'Vietnam',
      imageUrl: '/uploads/5.webp',
      status: 'active',
    });
    console.log('Created destination: Huế');
  }

  const haNoi = await Destination.findOne({ slug: 'ha-noi' });
  const cat = await TourCategory.findOne({ slug: 'tour-trong-nuoc' });
  const admin = await User.findOne({ role: 'admin' });

  const existing = await Tour.findOne({ slug: 'ha-noi-hue-3n2d' });
  if (existing) {
    await Tour.updateOne(
      { _id: existing._id },
      {
        $set: {
          title: 'Hà Nội - Huế 3N2Đ',
          mainImageUrl: '/uploads/5.webp',
          shortDescription: 'Khám phá cố đô Huế & di sản miền Trung',
          description: 'Tham quan Lăng Bác, Kinh thành Huế, sông Hương và ẩm thực cung đình.',
          ratingAvg: 4.85,
          ratingCount: 105,
          destinationIds: [haNoi?._id, hue._id].filter(Boolean),
          categoryIds: cat ? [cat._id] : [],
        },
      },
    );
    console.log('Updated tour: Hà Nội - Huế 3N2Đ');
  } else {
    const tour = await Tour.create({
      code: 'HN-HUE-009',
      title: 'Hà Nội - Huế 3N2Đ',
      slug: 'ha-noi-hue-3n2d',
      departurePlaceName: 'Hà Nội',
      durationDays: 3,
      durationNights: 2,
      basePrice: 4500000,
      shortDescription: 'Khám phá cố đô Huế & di sản miền Trung',
      description: 'Tham quan Lăng Bác, Kinh thành Huế, sông Hương và ẩm thực cung đình.',
      mainImageUrl: '/uploads/5.webp',
      ratingAvg: 4.85,
      ratingCount: 105,
      status: 'active',
      createdBy: admin?._id,
      categoryIds: cat ? [cat._id] : [],
      destinationIds: [haNoi?._id, hue._id].filter(Boolean),
    });

    await TourDeparture.insertMany([
      {
        tourId: tour._id,
        departureCode: 'HN-HUE-009-01',
        startDate: future(7),
        endDate: future(9),
        capacity: 30,
        adultPrice: tour.basePrice,
        childPrice: Math.round(tour.basePrice * 0.7),
        status: 'open',
      },
      {
        tourId: tour._id,
        departureCode: 'HN-HUE-009-02',
        startDate: future(14),
        endDate: future(16),
        capacity: 30,
        adultPrice: tour.basePrice,
        childPrice: Math.round(tour.basePrice * 0.7),
        status: 'open',
      },
    ]);
    console.log('Created tour: Hà Nội - Huế 3N2Đ');
  }

  await migrateDbImageUrls(Tour, Destination);
  await disconnectDB();
  console.log('Done.');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
