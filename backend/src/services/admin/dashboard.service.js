const { Tour, Booking, User, Vehicle, Driver } = require('../../models');

async function getDashboardData() {
  const now = new Date();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now);
  monthAgo.setMonth(monthAgo.getMonth() - 6);

  const [
    totalTours, totalBookings, pendingBookings, totalCustomers, revenueAgg,
    bookingsLast7, newCustomersLast7, totalVehicles, availableDrivers,
    recentBookings, topTours, revenueByMonth,
  ] = await Promise.all([
    Tour.countDocuments({ status: 'active' }),
    Booking.countDocuments(),
    Booking.countDocuments({ status: { $in: ['pending', 'confirmed'] } }),
    User.countDocuments({ role: 'customer' }),
    Booking.aggregate([{ $match: { paymentStatus: { $in: ['paid', 'partial'] } } }, { $group: { _id: null, total: { $sum: '$paidAmount' } } }]),
    Booking.countDocuments({ createdAt: { $gte: weekAgo } }),
    User.countDocuments({ role: 'customer', createdAt: { $gte: weekAgo } }),
    Vehicle.countDocuments(),
    Driver.countDocuments({ status: 'available' }),
    Booking.find().sort({ createdAt: -1 }).limit(10).lean(),
    Booking.aggregate([
      { $group: { _id: '$tourId', count: { $sum: 1 }, revenue: { $sum: '$paidAmount' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    Booking.aggregate([
      { $match: { createdAt: { $gte: monthAgo }, paymentStatus: { $in: ['paid', 'partial'] } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$paidAmount' }, bookingCount: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  const tourIds = topTours.map((t) => t._id).filter(Boolean);
  const tours = await Tour.find({ _id: { $in: tourIds } }).lean();
  const tourMap = Object.fromEntries(tours.map((t) => [t._id.toString(), t]));

  return {
    stats: {
      TotalTours: totalTours,
      TotalBookings: totalBookings,
      PendingBookings: pendingBookings,
      TotalCustomers: totalCustomers,
      TotalRevenue: revenueAgg[0]?.total || 0,
      BookingsLast7Days: bookingsLast7,
      NewCustomersLast7Days: newCustomersLast7,
      TotalVehicles: totalVehicles,
      AvailableDrivers: availableDrivers,
    },
    revenueByMonth: revenueByMonth.map((r) => ({ Year: r._id.year, Month: r._id.month, Revenue: r.revenue, BookingCount: r.bookingCount })),
    recentBookings: recentBookings.map((b) => ({
      BookingId: b._id.toString(),
      BookingCode: b.bookingCode,
      CustomerFullName: b.customerFullName,
      TourTitleSnapshot: b.tourTitleSnapshot,
      TotalAmount: b.totalAmount,
      PaymentStatus: b.paymentStatus,
      Status: b.status,
      CreatedAt: b.createdAt,
    })),
    topTours: topTours.map((t) => {
      const tour = tourMap[t._id?.toString()];
      return {
        TourId: t._id?.toString(),
        Title: tour?.title,
        Slug: tour?.slug,
        MainImageUrl: tour?.mainImageUrl,
        RatingAvg: tour?.ratingAvg,
        BookingCount: t.count,
        Revenue: t.revenue,
      };
    }),
    topDestinations: [],
  };
}

module.exports = { getDashboardData };
