const {
  Booking, TourDeparture, Tour, Promotion, Payment, TransportService, PickupPoint,
} = require('../models');
const { generateBookingCode, generatePaymentCode } = require('../utils/code');
const { mapBooking } = require('../db/mapper');

async function createBooking(user, body) {
  const {
    departureId, transportServiceId, pickupPointId,
    adultQuantity, childQuantity, infantQuantity,
    doorToDoorAddress, seatNumbers, note, promoCode,
    customerName, customerPhone,
  } = body;

  const departure = await TourDeparture.findOne({ _id: departureId, status: 'open' });
  if (!departure) throw new Error('Lịch khởi hành không hợp lệ hoặc đã đóng.');

  const totalPeople = (parseInt(adultQuantity) || 0) + (parseInt(childQuantity) || 0) + (parseInt(infantQuantity) || 0);
  const available = departure.capacity - departure.bookedCount - departure.holdCount;
  if (totalPeople > available) throw new Error('Không đủ chỗ trống cho booking này.');

  const tour = await Tour.findById(departure.tourId);
  if (!tour) throw new Error('Tour không tồn tại.');

  let tourAmount = (parseInt(adultQuantity) || 0) * departure.adultPrice
    + (parseInt(childQuantity) || 0) * departure.childPrice
    + (parseInt(infantQuantity) || 0) * (departure.infantPrice || 0);

  let transportAmount = 0;
  let transportData = null;

  if (transportServiceId) {
    const ts = await TransportService.findById(transportServiceId);
    if (ts) {
      transportAmount = (parseInt(adultQuantity) || 0) * ts.adultPrice + (parseInt(childQuantity) || 0) * ts.childPrice;
      let pickupName = null;
      if (pickupPointId) {
        const pp = await PickupPoint.findById(pickupPointId);
        pickupName = pp?.name;
      }
      transportData = {
        transportServiceId: ts._id,
        serviceName: ts.name,
        mode: ts.mode,
        pickupPointName: pickupName,
        doorToDoorAddress: doorToDoorAddress || null,
        seatNumbers: seatNumbers || null,
        extraFee: transportAmount,
      };
    }
  }

  let discountAmount = 0;
  if (promoCode) {
    const promo = await Promotion.findOne({
      code: promoCode,
      status: 'active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });
    if (promo) {
      const subtotal = tourAmount + transportAmount;
      if (promo.discountType === 'percent') {
        discountAmount = (subtotal * promo.discountValue) / 100;
        if (promo.maxDiscountAmount && discountAmount > promo.maxDiscountAmount) {
          discountAmount = promo.maxDiscountAmount;
        }
      } else {
        discountAmount = promo.discountValue;
      }
      promo.usedCount += 1;
      await promo.save();
    }
  }

  const totalAmount = Math.max(0, tourAmount + transportAmount - discountAmount);
  const bookingCode = generateBookingCode();

  const booking = await Booking.create({
    bookingCode,
    customerId: user.UserId,
    tourId: tour._id,
    departureId: departure._id,
    customerFullName: customerName || user.FullName,
    customerPhone: customerPhone || user.Phone,
    customerEmail: user.Email,
    tourCodeSnapshot: tour.code,
    tourTitleSnapshot: tour.title,
    startDateSnapshot: departure.startDate,
    endDateSnapshot: departure.endDate,
    adultQuantity: parseInt(adultQuantity) || 0,
    childQuantity: parseInt(childQuantity) || 0,
    infantQuantity: parseInt(infantQuantity) || 0,
    tourAmount,
    transportAmount,
    discountAmount,
    totalAmount,
    paidAmount: 0,
    remainingAmount: totalAmount,
    paymentStatus: 'unpaid',
    status: 'pending',
    note,
    promoCode,
    transport: transportData,
  });

  departure.bookedCount += totalPeople;
  if (departure.bookedCount >= departure.capacity) departure.status = 'full';
  await departure.save();

  return mapBooking(booking.toObject(), { mainImageUrl: tour.mainImageUrl, tourSlug: tour.slug });
}

async function getActivePromotions() {
  const promos = await Promotion.find({
    status: 'active',
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
    $or: [{ usageLimit: null }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }],
  }).lean();
  return promos.map((p) => ({
    Code: p.code,
    DiscountType: p.discountType,
    DiscountValue: p.discountValue,
    Description: p.description,
    MinOrderAmount: p.minOrderAmount,
    MaxDiscountAmount: p.maxDiscountAmount,
    EndDate: p.endDate,
  }));
}

async function getMyBookings(userId, page = 1, limit = 10) {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [total, bookings] = await Promise.all([
    Booking.countDocuments({ customerId: userId }),
    Booking.find({ customerId: userId }).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
  ]);

  const tourIds = bookings.map((b) => b.tourId);
  const tours = await Tour.find({ _id: { $in: tourIds } }).lean();
  const tourMap = Object.fromEntries(tours.map((t) => [t._id.toString(), t]));

  const data = bookings.map((b) => mapBooking(b, {
    mainImageUrl: tourMap[b.tourId?.toString()]?.mainImageUrl,
    tourSlug: tourMap[b.tourId?.toString()]?.slug,
  }));

  return { data, pagination: { total, page: parseInt(page), limit: parseInt(limit) } };
}

async function getBookingByCode(code, userId) {
  const booking = await Booking.findOne({ bookingCode: code, customerId: userId }).lean();
  if (!booking) return null;

  const tour = await Tour.findById(booking.tourId).lean();
  const payments = await Payment.find({ bookingId: booking._id }).lean();

  return mapBooking(booking, {
    mainImageUrl: tour?.mainImageUrl,
    tourSlug: tour?.slug,
    payments: payments.map((p) => ({
      PaymentId: p._id.toString(),
      PaymentCode: p.paymentCode,
      Amount: p.amount,
      Method: p.method,
      Status: p.status,
      PaidAt: p.paidAt,
    })),
  });
}

async function payBooking(bookingId, { amount, method, note }) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error('Booking không tồn tại.');

  const payAmount = parseFloat(amount);
  const payment = await Payment.create({
    paymentCode: generatePaymentCode(),
    bookingId: booking._id,
    customerId: booking.customerId,
    amount: payAmount,
    method,
    status: 'success',
    paidAt: new Date(),
    note,
  });

  booking.paidAmount += payAmount;
  booking.remainingAmount = Math.max(0, booking.totalAmount - booking.paidAmount);
  booking.paymentStatus = booking.remainingAmount <= 0 ? 'paid' : 'partial';
  await booking.save();

  return {
    PaymentId: payment._id.toString(),
    PaymentCode: payment.paymentCode,
    Amount: payment.amount,
    BookingId: booking._id.toString(),
    PaymentStatus: booking.paymentStatus,
    RemainingAmount: booking.remainingAmount,
  };
}

async function checkPromo(code, amount) {
  const promo = await Promotion.findOne({
    code,
    status: 'active',
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  }).lean();

  if (!promo || (promo.usageLimit != null && promo.usedCount >= promo.usageLimit)) {
    return { error: { status: 400, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn.' } };
  }
  if (promo.minOrderAmount && parseFloat(amount) < promo.minOrderAmount) {
    return { error: { status: 400, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn.' } };
  }

  let discount = 0;
  if (promo.discountType === 'percent') {
    discount = (parseFloat(amount) * promo.discountValue) / 100;
    if (promo.maxDiscountAmount && discount > promo.maxDiscountAmount) discount = promo.maxDiscountAmount;
  } else {
    discount = promo.discountValue;
  }

  return {
    Code: promo.code,
    DiscountType: promo.discountType,
    DiscountValue: promo.discountValue,
    calculatedDiscount: discount,
  };
}

module.exports = {
  createBooking, getActivePromotions, getMyBookings,
  getBookingByCode, payBooking, checkPromo,
};
