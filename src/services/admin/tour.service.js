const mongoose = require('mongoose');
const {
  Tour,
  TourDeparture,
  TourItinerary,
  TourCategory,
  Destination,
  Booking,
} = require('../../models');
const { TOUR_STATUS } = require('../../constants');
const { createSlug } = require('../../utils/slug');
const {
  mapTour,
  mapDeparture,
  mapItinerary,
  mapCategory,
  mapDestination,
} = require('../../db/mapper');

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function parsePositiveInt(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseNonNegativeFloat(value, fallback = 0) {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseBoolean(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function normalizeIdArray(value) {
  const items = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',').map((item) => item.trim()).filter(Boolean)
      : [];

  return [...new Set(items.filter((item) => mongoose.Types.ObjectId.isValid(item)).map(String))];
}

function toObjectIdList(ids) {
  return ids.map((id) => new mongoose.Types.ObjectId(id));
}

function ensureValidTourStatus(status) {
  if (!Object.values(TOUR_STATUS).includes(status)) {
    throw httpError(400, 'Trang thai tour khong hop le.');
  }
}

async function ensureUniqueCode(code, excludeId) {
  const query = { code: code.trim() };
  if (excludeId) query._id = { $ne: excludeId };
  const existing = await Tour.findOne(query).lean();
  if (existing) {
    throw httpError(409, 'Ma tour da ton tai.');
  }
}

async function buildUniqueSlug(title, requestedSlug, excludeId, currentTour) {
  const preferredSlug = (requestedSlug || '').trim();
  if (!preferredSlug && currentTour?.slug) {
    return currentTour.slug;
  }

  const baseSlug = createSlug(preferredSlug || title || '');

  if (!baseSlug) {
    throw httpError(400, 'Slug khong hop le.');
  }

  let slug = baseSlug;
  const query = { slug };
  if (excludeId) query._id = { $ne: excludeId };
  const existing = await Tour.findOne(query).lean();
  if (!existing) return slug;

  slug = `${baseSlug}-${Date.now()}`;
  return slug;
}

async function buildTourPayload(body, options = {}) {
  const code = body.code?.trim();
  const title = body.title?.trim();
  const status = body.status || TOUR_STATUS.DRAFT;
  const durationDays = parsePositiveInt(body.durationDays);
  const durationNights = parsePositiveInt(body.durationNights);
  const basePrice = parseNonNegativeFloat(body.basePrice);
  const categoryIds = normalizeIdArray(body.categoryIds);
  const destinationIds = normalizeIdArray(body.destinationIds);

  if (!code) throw httpError(400, 'Ma tour la bat buoc.');
  if (!title) throw httpError(400, 'Ten tour la bat buoc.');
  if (durationDays < 1) throw httpError(400, 'So ngay phai lon hon 0.');
  if (durationNights < 0) throw httpError(400, 'So dem khong hop le.');
  if (basePrice < 0) throw httpError(400, 'Gia tour khong hop le.');
  ensureValidTourStatus(status);

  await ensureUniqueCode(code, options.excludeId);

  const slug = await buildUniqueSlug(title, body.slug, options.excludeId, options.currentTour);

  return {
    code,
    title,
    slug,
    departurePlaceName: body.departurePlaceName?.trim() || '',
    durationDays,
    durationNights,
    basePrice,
    shortDescription: body.shortDescription?.trim() || '',
    description: body.description?.trim() || '',
    includedServices: body.includedServices?.trim() || '',
    excludedServices: body.excludedServices?.trim() || '',
    cancellationPolicy: body.cancellationPolicy?.trim() || '',
    childPolicy: body.childPolicy?.trim() || '',
    paymentPolicy: body.paymentPolicy?.trim() || '',
    mainImageUrl: body.mainImageUrl?.trim() || '',
    tags: body.tags?.trim() || '',
    status,
    categoryIds: toObjectIdList(categoryIds),
    destinationIds: toObjectIdList(destinationIds),
  };
}

async function getLookups() {
  const [categories, destinations] = await Promise.all([
    TourCategory.find({ status: 'active' }).sort({ name: 1 }).lean(),
    Destination.find({ status: 'active' }).sort({ name: 1 }).lean(),
  ]);

  return {
    categories: categories.map((item) => mapCategory(item)),
    destinations: destinations.map((item) => mapDestination(item)),
  };
}

async function listTours({ page = 1, limit = 15, search, status }) {
  const currentPage = Math.max(parsePositiveInt(page, 1), 1);
  const currentLimit = Math.max(parsePositiveInt(limit, 15), 1);
  const skip = (currentPage - 1) * currentLimit;
  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
  }

  if (status) query.status = status;

  const [total, tours] = await Promise.all([
    Tour.countDocuments(query),
    Tour.find(query).sort({ createdAt: -1 }).skip(skip).limit(currentLimit).lean(),
  ]);

  const bookingCounts = await Booking.aggregate([
    { $match: { tourId: { $in: tours.map((tour) => tour._id) } } },
    { $group: { _id: '$tourId', totalBookings: { $sum: 1 } } },
  ]);

  const bookingMap = Object.fromEntries(
    bookingCounts.map((item) => [item._id.toString(), item.totalBookings]),
  );

  return {
    data: tours.map((tour) => mapTour(tour, {
      totalBookings: bookingMap[tour._id.toString()] || 0,
    })),
    pagination: {
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.max(1, Math.ceil(total / currentLimit)),
    },
  };
}

async function listAllDepartures({ page = 1, limit = 15, tourId }) {
  const currentPage = Math.max(parsePositiveInt(page, 1), 1);
  const currentLimit = Math.max(parsePositiveInt(limit, 15), 1);
  const skip = (currentPage - 1) * currentLimit;
  const query = {};

  if (tourId && mongoose.Types.ObjectId.isValid(tourId)) {
    query.tourId = tourId;
  }

  const [total, departures] = await Promise.all([
    TourDeparture.countDocuments(query),
    TourDeparture.find(query).sort({ startDate: -1 }).skip(skip).limit(currentLimit).lean(),
  ]);

  const tourIds = [...new Set(departures.map((item) => item.tourId?.toString()).filter(Boolean))];
  const tours = await Tour.find({ _id: { $in: tourIds } }).lean();
  const tourMap = Object.fromEntries(tours.map((tour) => [tour._id.toString(), tour]));

  return {
    data: departures.map((departure) => mapDeparture({
      ...departure,
      tourTitle: tourMap[departure.tourId?.toString()]?.title,
      tourCode: tourMap[departure.tourId?.toString()]?.code,
    })),
    pagination: {
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.max(1, Math.ceil(total / currentLimit)),
    },
  };
}

async function getTourById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  const tour = await Tour.findById(id).lean();
  if (!tour) return null;

  const [itineraries, departures, categories, destinations] = await Promise.all([
    TourItinerary.find({ tourId: id }).sort({ dayNumber: 1 }).lean(),
    TourDeparture.find({ tourId: id }).sort({ startDate: 1 }).lean(),
    TourCategory.find({ _id: { $in: tour.categoryIds || [] } }).sort({ name: 1 }).lean(),
    Destination.find({ _id: { $in: tour.destinationIds || [] } }).sort({ name: 1 }).lean(),
  ]);

  return {
    ...mapTour(tour),
    categoryIds: (tour.categoryIds || []).map((item) => item.toString()),
    destinationIds: (tour.destinationIds || []).map((item) => item.toString()),
    itineraries: itineraries.map((item) => mapItinerary(item)),
    departures: departures.map((item) => mapDeparture(item)),
    categories: categories.map((item) => mapCategory(item)),
    destinations: destinations.map((item) => mapDestination(item)),
  };
}

async function createTour(body, userId) {
  const payload = await buildTourPayload(body);
  const tour = await Tour.create({
    ...payload,
    createdBy: mongoose.Types.ObjectId.isValid(userId) ? userId : undefined,
  });

  return { tourId: tour._id.toString() };
}

async function updateTour(id, body) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(404, 'Tour khong ton tai.');
  }

  const currentTour = await Tour.findById(id).lean();
  if (!currentTour) {
    throw httpError(404, 'Tour khong ton tai.');
  }

  const payload = await buildTourPayload(body, {
    excludeId: id,
    currentTour,
  });

  await Tour.findByIdAndUpdate(id, payload);
}

async function deleteTour(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(404, 'Tour khong ton tai.');
  }

  const updated = await Tour.findByIdAndUpdate(id, { status: TOUR_STATUS.ARCHIVED });
  if (!updated) {
    throw httpError(404, 'Tour khong ton tai.');
  }
}

async function getDepartures(tourId) {
  if (!mongoose.Types.ObjectId.isValid(tourId)) return [];
  const departures = await TourDeparture.find({ tourId }).sort({ startDate: 1 }).lean();
  return departures.map((item) => mapDeparture(item));
}

async function buildDeparturePayload(body, options = {}) {
  const departureCode = body.departureCode?.trim();
  const startDate = new Date(body.startDate);
  const endDate = new Date(body.endDate);
  const capacity = parsePositiveInt(body.capacity);
  const adultPrice = parseNonNegativeFloat(body.adultPrice);
  const childPrice = parseNonNegativeFloat(body.childPrice);
  const infantPrice = parseNonNegativeFloat(body.infantPrice);
  const status = body.status?.trim() || 'open';

  if (!departureCode) throw httpError(400, 'Ma lich khoi hanh la bat buoc.');
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw httpError(400, 'Ngay khoi hanh khong hop le.');
  }
  if (startDate > endDate) throw httpError(400, 'Ngay ket thuc phai sau ngay bat dau.');
  if (capacity < 1) throw httpError(400, 'So cho phai lon hon 0.');
  if (adultPrice < 0 || childPrice < 0 || infantPrice < 0) {
    throw httpError(400, 'Gia lich khoi hanh khong hop le.');
  }

  const query = { departureCode };
  if (options.excludeId) query._id = { $ne: options.excludeId };
  const existing = await TourDeparture.findOne(query).lean();
  if (existing) throw httpError(409, 'Ma lich khoi hanh da ton tai.');

  return {
    departureCode,
    startDate,
    endDate,
    capacity,
    adultPrice,
    childPrice,
    infantPrice,
    status,
  };
}

async function createDeparture(tourId, body) {
  if (!mongoose.Types.ObjectId.isValid(tourId)) {
    throw httpError(404, 'Tour khong ton tai.');
  }

  const tour = await Tour.findById(tourId).lean();
  if (!tour) throw httpError(404, 'Tour khong ton tai.');

  const payload = await buildDeparturePayload(body);
  await TourDeparture.create({ ...payload, tourId });
}

async function updateDeparture(id, body) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(404, 'Lich khoi hanh khong ton tai.');
  }

  const current = await TourDeparture.findById(id).lean();
  if (!current) throw httpError(404, 'Lich khoi hanh khong ton tai.');

  const payload = await buildDeparturePayload(body, { excludeId: id });

  await TourDeparture.findByIdAndUpdate(id, payload);
}

async function deleteDeparture(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(404, 'Lich khoi hanh khong ton tai.');
  }

  const departure = await TourDeparture.findById(id).lean();
  if (!departure) throw httpError(404, 'Lich khoi hanh khong ton tai.');
  if ((departure.bookedCount || 0) > 0 || (departure.holdCount || 0) > 0) {
    throw httpError(400, 'Khong the xoa lich khoi hanh da co cho dat.');
  }

  await TourDeparture.findByIdAndDelete(id);
}

function buildItineraryPayload(body) {
  const dayNumber = parsePositiveInt(body.dayNumber);
  const title = body.title?.trim();

  if (dayNumber < 1) throw httpError(400, 'Ngay lich trinh khong hop le.');
  if (!title) throw httpError(400, 'Tieu de lich trinh la bat buoc.');

  return {
    dayNumber,
    title,
    activities: body.activities?.trim() || '',
    breakfast: parseBoolean(body.breakfast),
    lunch: parseBoolean(body.lunch),
    dinner: parseBoolean(body.dinner),
    accommodation: body.accommodation?.trim() || '',
  };
}

async function createItinerary(tourId, body) {
  if (!mongoose.Types.ObjectId.isValid(tourId)) {
    throw httpError(404, 'Tour khong ton tai.');
  }

  const tour = await Tour.findById(tourId).lean();
  if (!tour) throw httpError(404, 'Tour khong ton tai.');

  await TourItinerary.create({
    tourId,
    ...buildItineraryPayload(body),
  });
}

async function updateItinerary(id, body) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(404, 'Lich trinh khong ton tai.');
  }

  const updated = await TourItinerary.findByIdAndUpdate(id, buildItineraryPayload(body));
  if (!updated) throw httpError(404, 'Lich trinh khong ton tai.');
}

async function deleteItinerary(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw httpError(404, 'Lich trinh khong ton tai.');
  }

  const deleted = await TourItinerary.findByIdAndDelete(id);
  if (!deleted) throw httpError(404, 'Lich trinh khong ton tai.');
}

module.exports = {
  getLookups,
  listTours,
  listAllDepartures,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  getDepartures,
  createDeparture,
  updateDeparture,
  deleteDeparture,
  createItinerary,
  updateItinerary,
  deleteItinerary,
};
