const mongoose = require('mongoose');
const { Booking, Tour } = require('../../models');
const { mapBooking } = require('../../db/mapper');

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function parsePositiveInt(value, fallback = 15) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

async function listBookings({ page = 1, limit = 15, search, status, paymentStatus }) {
  const currentPage = Math.max(parsePositiveInt(page, 1), 1);
  const currentLimit = Math.max(parsePositiveInt(limit, 15), 1);
  const skip = (currentPage - 1) * currentLimit;
  const query = {};

  if (search) {
    query.$or = [
      { bookingCode: { $regex: search, $options: 'i' } },
      { customerFullName: { $regex: search, $options: 'i' } },
      { customerPhone: { $regex: search, $options: 'i' } },
      { customerEmail: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) query.status = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;

  const [total, bookings] = await Promise.all([
    Booking.countDocuments(query),
    Booking.find(query).sort({ createdAt: -1 }).skip(skip).limit(currentLimit).lean(),
  ]);

  return {
    data: bookings.map((item) => mapBooking(item)),
    pagination: {
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.max(1, Math.ceil(total / currentLimit)),
    },
  };
}

async function getBookingById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const booking = await Booking.findById(id).lean();
  if (!booking) return null;

  const tour = await Tour.findById(booking.tourId).lean();
  return mapBooking(booking, {
    mainImageUrl: tour?.mainImageUrl,
    tourSlug: tour?.slug,
  });
}

async function updateStatus(id, status) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw httpError(404, 'Booking khong ton tai.');
  if (!status) throw httpError(400, 'Trang thai booking la bat buoc.');

  const updated = await Booking.findByIdAndUpdate(id, { status });
  if (!updated) throw httpError(404, 'Booking khong ton tai.');
}

async function confirmBooking(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw httpError(404, 'Booking khong ton tai.');
  const updated = await Booking.findOneAndUpdate({ _id: id, status: 'pending' }, { status: 'confirmed' });
  if (!updated) throw httpError(400, 'Chi booking cho xu ly moi duoc xac nhan.');
}

async function cancelBooking(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw httpError(404, 'Booking khong ton tai.');
  const updated = await Booking.findByIdAndUpdate(id, { status: 'cancelled' });
  if (!updated) throw httpError(404, 'Booking khong ton tai.');
}

module.exports = { listBookings, getBookingById, updateStatus, confirmBooking, cancelBooking };
