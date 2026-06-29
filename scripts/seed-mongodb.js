require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { connectDB, disconnectDB } = require('../src/db');
const {
  User, Destination, TourCategory, Tour, TourItinerary, TourDeparture,
  TransportProvider, Vehicle, Driver, TransportRoute, PickupPoint,
  TransportService, Promotion, Booking,
} = require('../src/models');

const future = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

async function seed() {
  await connectDB();
  console.log('🗑️  Clearing collections...');
  await Promise.all([
    Booking.deleteMany({}),
    TransportService.deleteMany({}),
    PickupPoint.deleteMany({}),
    TransportRoute.deleteMany({}),
    Driver.deleteMany({}),
    Vehicle.deleteMany({}),
    TransportProvider.deleteMany({}),
    TourDeparture.deleteMany({}),
    TourItinerary.deleteMany({}),
    Tour.deleteMany({}),
    Promotion.deleteMany({}),
    TourCategory.deleteMany({}),
    Destination.deleteMany({}),
    User.deleteMany({}),
  ]);

  console.log('👤 Creating users...');
  const [admin, customer, staff] = await User.insertMany([
    { fullName: 'Admin VietTravel', email: 'admin@travel.com', phone: '0901000001', passwordHash: await bcrypt.hash('Admin@123456', 10), role: 'admin', status: 'active' },
    { fullName: 'Nguyễn Văn A', email: 'vana@gmail.com', phone: '0901234567', passwordHash: await bcrypt.hash('Customer@123', 10), role: 'customer', status: 'active', gender: 'male' },
    { fullName: 'Nhân viên Sales', email: 'staff@travel.com', phone: '0901000002', passwordHash: await bcrypt.hash('Staff@123456', 10), role: 'staff', status: 'active' },
  ]);

  console.log('📍 Creating destinations & categories...');
  const dests = await Destination.insertMany([
    { name: 'Đà Nẵng', slug: 'da-nang', province: 'Đà Nẵng', country: 'Vietnam', imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80' },
    { name: 'Hội An', slug: 'hoi-an', province: 'Quảng Nam', country: 'Vietnam', imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&q=80' },
    { name: 'Hà Nội', slug: 'ha-noi', province: 'Hà Nội', country: 'Vietnam', imageUrl: 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=600&q=80' },
    { name: 'Phú Quốc', slug: 'phu-quoc', province: 'Kiên Giang', country: 'Vietnam', imageUrl: 'https://images.unsplash.com/photo-1597945161640-9366e6d4253b?w=600&q=80' },
    { name: 'Sa Pa', slug: 'sapa', province: 'Lào Cai', country: 'Vietnam', imageUrl: 'https://images.unsplash.com/photo-1569587112025-0d460e81a126?w=600&q=80' },
    { name: 'Hạ Long', slug: 'ha-long', province: 'Quảng Ninh', country: 'Vietnam', imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80' },
    { name: 'Nha Trang', slug: 'nha-trang', province: 'Khánh Hòa', country: 'Vietnam', imageUrl: 'https://images.unsplash.com/photo-1582650745070-52cd65e31766?w=600&q=80' },
    { name: 'Ninh Bình', slug: 'ninh-binh', province: 'Ninh Bình', country: 'Vietnam', imageUrl: '/uploads/2.webp' },
    { name: 'Huế', slug: 'hue', province: 'Thừa Thiên Huế', country: 'Vietnam', imageUrl: '/uploads/5.webp' },
    { name: 'Quảng Bình', slug: 'quang-binh', province: 'Quảng Bình', country: 'Vietnam', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80' },
  ]);

  const cats = await TourCategory.insertMany([
    { name: 'Tour trong nước', slug: 'tour-trong-nuoc', description: 'Khám phá Việt Nam' },
    { name: 'Tour nghỉ dưỡng', slug: 'tour-nghi-duong', description: 'Biển đảo & resort' },
    { name: 'Tour gia đình', slug: 'tour-gia-dinh', description: 'Phù hợp cả gia đình' },
    { name: 'Tour tâm linh', slug: 'tour-tam-linh', description: 'Hành hương & chiêm bái' },
  ]);

  console.log('🗺️  Creating tours...');
  const tourData = [
    { code: 'DN-HA-001', title: 'Đà Nẵng - Hội An 3N2Đ', slug: 'da-nang-hoi-an-3n2d', departurePlaceName: 'TP. Hồ Chí Minh', durationDays: 3, durationNights: 2, basePrice: 4990000, shortDescription: 'Khám phá Đà Nẵng và phố cổ Hội An', description: 'Tour trọn gói khám phá cầu Rồng, Bà Nà Hills và phố cổ Hội An.', mainImageUrl: '/uploads/1.webp', ratingAvg: 4.8, ratingCount: 128, categoryIds: [cats[0]._id, cats[1]._id], destinationIds: [dests[0]._id, dests[1]._id] },
    { code: 'HN-HL-002', title: 'Hà Nội - Hạ Long 4N3Đ', slug: 'ha-noi-ha-long-4n3d', departurePlaceName: 'Hà Nội', durationDays: 4, durationNights: 3, basePrice: 6500000, shortDescription: 'Thủ đô nghìn năm văn hiến & Vịnh Hạ Long', description: 'Tham quan Hà Nội, du thuyền Vịnh Hạ Long UNESCO.', mainImageUrl: '/uploads/3.webp', ratingAvg: 4.9, ratingCount: 95, categoryIds: [cats[0]._id], destinationIds: [dests[2]._id, dests[5]._id] },
    { code: 'PQ-003', title: 'Phú Quốc Nghỉ Dưỡng 5N4Đ', slug: 'phu-quoc-nghi-duong-5n4d', departurePlaceName: 'TP. Hồ Chí Minh', durationDays: 5, durationNights: 4, basePrice: 8900000, shortDescription: 'Thiên đường biển đảo Phú Quốc', description: 'Resort 4 sao, tour 3 đảo, safari và chợ đêm.', mainImageUrl: 'https://images.unsplash.com/photo-1597945161640-9366e6d4253b?w=800&q=80', ratingAvg: 4.7, ratingCount: 76, categoryIds: [cats[1]._id, cats[2]._id], destinationIds: [dests[3]._id] },
    { code: 'SP-004', title: 'Sa Pa Mùa Lúa Chín 3N2Đ', slug: 'sapa-mua-lua-chin-3n2d', departurePlaceName: 'Hà Nội', durationDays: 3, durationNights: 2, basePrice: 4200000, shortDescription: 'Săn mây Fansipan & bản làng Tây Bắc', description: 'Trekking bản làng, cáp treo Fansipan, khám phá văn hóa dân tộc.', mainImageUrl: 'https://images.unsplash.com/photo-1569587112025-0d460e81a126?w=800&q=80', ratingAvg: 4.6, ratingCount: 54, categoryIds: [cats[0]._id], destinationIds: [dests[4]._id] },
    { code: 'HL-005', title: 'Hạ Long Cuối Tuần 2N1Đ', slug: 'ha-long-cuoi-tuan-2n1d', departurePlaceName: 'Hà Nội', durationDays: 2, durationNights: 1, basePrice: 3200000, shortDescription: 'Du thuyền Hạ Long 2 ngày 1 đêm', description: 'Ngắm vịnh Hạ Long, kayak, tắm biển Titop.', mainImageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80', ratingAvg: 4.5, ratingCount: 88, categoryIds: [cats[0]._id, cats[1]._id], destinationIds: [dests[5]._id] },
    { code: 'NT-006', title: 'Nha Trang Biển Đảo Hoang Sơ', slug: 'nha-trang-bien-da-hoang-so', departurePlaceName: 'TP. Hồ Chí Minh', durationDays: 4, durationNights: 3, basePrice: 5500000, shortDescription: 'Nha Trang - thiên đường biển xanh', description: 'Tour 4 đảo, VinWonders, tắm bùn khoáng.', mainImageUrl: 'https://images.unsplash.com/photo-1582650745070-52cd65e31766?w=800&q=80', ratingAvg: 4.4, ratingCount: 62, categoryIds: [cats[1]._id], destinationIds: [dests[6]._id] },
    { code: 'HN-NB-007', title: 'Hà Nội - Ninh Bình Tràng An', slug: 'ha-noi-ninh-binh-trang-an', departurePlaceName: 'Hà Nội', durationDays: 2, durationNights: 1, basePrice: 2800000, shortDescription: 'Tràng An - Tam Cốc - Bái Đính', description: 'Thuyền Tràng An, chùa Bái Đính, Hang Múa.', mainImageUrl: '/uploads/2.webp', ratingAvg: 4.7, ratingCount: 110, categoryIds: [cats[0]._id, cats[3]._id], destinationIds: [dests[2]._id, dests[7]._id] },
    { code: 'QB-PN-008', title: 'Quảng Bình - Phong Nha Kẻ Bàng 3N2Đ', slug: 'kham-pha-quang-binh-phong-nha-ke-bang-3n2d', departurePlaceName: 'Hà Nội', durationDays: 3, durationNights: 2, basePrice: 3890000, shortDescription: 'Vương quốc hang động Phong Nha', description: 'Hang Phong Nha, Suối Nước Moọc, động Thiên Đường.', mainImageUrl: '/uploads/4.webp', ratingAvg: 4.9, ratingCount: 120, categoryIds: [cats[0]._id], destinationIds: [dests[9]._id] },
    { code: 'HN-HUE-009', title: 'Hà Nội - Huế 3N2Đ', slug: 'ha-noi-hue-3n2d', departurePlaceName: 'Hà Nội', durationDays: 3, durationNights: 2, basePrice: 4500000, shortDescription: 'Khám phá cố đô Huế & di sản miền Trung', description: 'Tham quan Lăng Bác, Kinh thành Huế, sông Hương và ẩm thực cung đình.', mainImageUrl: '/uploads/5.webp', ratingAvg: 4.85, ratingCount: 105, categoryIds: [cats[0]._id], destinationIds: [dests[2]._id, dests[8]._id] },
  ];

  const tours = await Tour.insertMany(tourData.map((t) => ({ ...t, status: 'active', createdBy: admin._id })));

  await TourItinerary.insertMany([
    { tourId: tours[0]._id, dayNumber: 1, title: 'Đà Nẵng', activities: 'Cầu Rồng, Bãi biển Mỹ Khê', breakfast: true, lunch: true, dinner: true },
    { tourId: tours[0]._id, dayNumber: 2, title: 'Hội An', activities: 'Phố cổ Hội An, làng gốm Thanh Hà', breakfast: true, lunch: true, dinner: false },
    { tourId: tours[1]._id, dayNumber: 1, title: 'Hà Nội', activities: 'Văn Miếu, Hồ Hoàn Kiếm', breakfast: true, lunch: true, dinner: true },
    { tourId: tours[1]._id, dayNumber: 2, title: 'Hạ Long', activities: 'Du thuyền vịnh Hạ Long', breakfast: true, lunch: true, dinner: true },
  ]);

  const departures = [];
  for (let i = 0; i < tours.length; i += 1) {
    const t = tours[i];
    departures.push(
      { tourId: t._id, departureCode: `${t.code}-01`, startDate: future(5 + i * 2), endDate: future(5 + i * 2 + t.durationDays - 1), capacity: 30, adultPrice: t.basePrice, childPrice: Math.round(t.basePrice * 0.7), status: 'open' },
      { tourId: t._id, departureCode: `${t.code}-02`, startDate: future(12 + i * 2), endDate: future(12 + i * 2 + t.durationDays - 1), capacity: 30, adultPrice: t.basePrice, childPrice: Math.round(t.basePrice * 0.7), status: 'open' },
    );
  }
  const deps = await TourDeparture.insertMany(departures);

  console.log('🚌 Creating transport...');
  const [provider1, provider2] = await TransportProvider.insertMany([
    { name: 'VietTravel Transport', type: 'company', contactPersonName: 'Nguyễn Văn Xe', contactPhone: '0909999888', status: 'active' },
    { name: 'Hoang Long', type: 'partner', contactPersonName: 'Trần Văn B', contactPhone: '0911222333', status: 'active' },
  ]);
  const [bus, limo] = await Vehicle.insertMany([
    { providerId: provider1._id, vehicleCode: 'VT-BUS-01', plateNumber: '51B-12345', type: 'bus', brand: 'Hyundai', model: 'Universe', seatCapacity: 45, status: 'available' },
    { providerId: provider1._id, vehicleCode: 'VT-LIM-01', plateNumber: '51B-99999', type: 'limousine', brand: 'Ford', model: 'Transit', seatCapacity: 16, status: 'available' },
  ]);
  const driver = await Driver.create({ providerId: provider1._id, fullName: 'Trần Văn Lái', phone: '0912345678', licenseNumber: 'B2-123456', status: 'available' });
  const route = await TransportRoute.create({ routeCode: 'SGN-DN', name: 'Sài Gòn - Đà Nẵng', fromName: 'TP.HCM', toName: 'Đà Nẵng', status: 'active' });
  await PickupPoint.create({ routeId: route._id, code: 'PP-01', name: 'Quận 1', address: '123 Nguyễn Huệ, Q1, TP.HCM', pickupTimeOffsetMinutes: 0 });

  await TransportService.insertMany([
    { departureId: deps[0]._id, tourId: tours[0]._id, providerId: provider1._id, vehicleId: bus._id, driverId: driver._id, routeId: route._id, serviceCode: 'TR-BUS-01', name: 'Xe giường nằm cao cấp', mode: 'bus', serviceType: 'tour_transfer', adultPrice: 300000, childPrice: 200000, seatCapacity: 45, allowCustomerSelect: true, status: 'open' },
    { departureId: deps[0]._id, tourId: tours[0]._id, providerId: provider1._id, vehicleId: limo._id, serviceCode: 'TR-LIM-01', name: 'Limousine VIP 16 chỗ', mode: 'limousine', serviceType: 'tour_transfer', adultPrice: 500000, childPrice: 400000, seatCapacity: 16, allowCustomerSelect: true, status: 'open' },
  ]);

  console.log('🏷️  Creating promotions & sample booking...');
  await Promotion.create({
    code: 'SUMMER2026', name: 'Giảm giá mùa hè', description: 'Giảm 10% tour hè 2026',
    discountType: 'percent', discountValue: 10, maxDiscountAmount: 1000000, minOrderAmount: 3000000,
    startDate: new Date(), endDate: future(90), usageLimit: 100, status: 'active', tourIds: [tours[0]._id, tours[2]._id],
  });

  await Booking.create({
    bookingCode: 'BK-20260620-0001',
    customerId: customer._id,
    tourId: tours[0]._id,
    departureId: deps[0]._id,
    customerFullName: customer.fullName,
    customerPhone: customer.phone,
    customerEmail: customer.email,
    tourTitleSnapshot: tours[0].title,
    startDateSnapshot: deps[0].startDate,
    endDateSnapshot: deps[0].endDate,
    adultQuantity: 2,
    childQuantity: 1,
    infantQuantity: 0,
    totalAmount: 12980000,
    paidAmount: 6490000,
    remainingAmount: 6490000,
    paymentStatus: 'partial',
    status: 'confirmed',
  });

  console.log(`
✅ Seed completed!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Admin   : admin@travel.com / Admin@123456
Staff   : staff@travel.com / Staff@123456
Customer: vana@gmail.com / Customer@123
Tours   : ${tours.length} tours, ${deps.length} departures
Dest    : ${dests.length} destinations
  `);

  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
