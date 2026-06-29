const mongoose = require('mongoose');
const { Promotion, Tour } = require('../../models');
const { mapPromotion, mapTour } = require('../../db/mapper');

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function parsePositiveInt(value, fallback = 15) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseFloatValue(value, fallback = null) {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseDateValue(value, fieldName) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw httpError(400, `${fieldName} khong hop le.`);
  }
  return date;
}

function normalizeIdArray(value) {
  const items = Array.isArray(value) ? value : [];
  return [...new Set(items.filter((item) => mongoose.Types.ObjectId.isValid(item)).map(String))];
}

async function getLookups() {
  const tours = await Tour.find({ status: { $in: ['active', 'inactive', 'draft'] } }).sort({ title: 1 }).lean();
  return {
    tours: tours.map((item) => mapTour(item)),
  };
}

async function listPromotions({ page = 1, limit = 15, status, search }) {
  const currentPage = Math.max(parsePositiveInt(page, 1), 1);
  const currentLimit = Math.max(parsePositiveInt(limit, 15), 1);
  const skip = (currentPage - 1) * currentLimit;
  const query = {};

  if (status) query.status = status;
  if (search) {
    query.$or = [
      { code: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
    ];
  }

  const [total, promotions] = await Promise.all([
    Promotion.countDocuments(query),
    Promotion.find(query).sort({ createdAt: -1 }).skip(skip).limit(currentLimit).lean(),
  ]);

  return {
    data: promotions.map((item) => mapPromotion(item)),
    pagination: {
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.max(1, Math.ceil(total / currentLimit)),
    },
  };
}

async function getPromotionById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const promotion = await Promotion.findById(id).lean();
  if (!promotion) return null;

  const tours = await Tour.find({ _id: { $in: promotion.tourIds || [] } }).sort({ title: 1 }).lean();

  return {
    ...mapPromotion(promotion),
    tourIds: (promotion.tourIds || []).map((item) => item.toString()),
    tours: tours.map((item) => mapTour(item)),
  };
}

async function createPromotion(body) {
  const code = body.code?.trim();
  const name = body.name?.trim();
  if (!code || !name) {
    throw httpError(400, 'Ma va ten khuyen mai la bat buoc.');
  }

  const existing = await Promotion.findOne({ code }).lean();
  if (existing) throw httpError(409, 'Ma khuyen mai da ton tai.');

  const promotion = await Promotion.create({
    code,
    name,
    description: body.description?.trim() || '',
    discountType: body.discountType,
    discountValue: parseFloatValue(body.discountValue, 0),
    maxDiscountAmount: parseFloatValue(body.maxDiscountAmount, null),
    minOrderAmount: parseFloatValue(body.minOrderAmount, null),
    startDate: parseDateValue(body.startDate, 'Ngay bat dau'),
    endDate: parseDateValue(body.endDate, 'Ngay ket thuc'),
    usageLimit: parsePositiveInt(body.usageLimit, null),
    status: body.status || 'active',
  });

  return { promotionId: promotion._id.toString() };
}

async function updatePromotion(id, body) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw httpError(404, 'Khuyen mai khong ton tai.');
  const current = await Promotion.findById(id).lean();
  if (!current) throw httpError(404, 'Khuyen mai khong ton tai.');

  const nextCode = body.code?.trim() || current.code;
  const existing = await Promotion.findOne({ code: nextCode, _id: { $ne: id } }).lean();
  if (existing) throw httpError(409, 'Ma khuyen mai da ton tai.');

  await Promotion.findByIdAndUpdate(id, {
    code: nextCode,
    name: body.name?.trim() || current.name,
    description: body.description?.trim() || '',
    discountType: body.discountType || current.discountType,
    discountValue: parseFloatValue(body.discountValue, current.discountValue),
    maxDiscountAmount: parseFloatValue(body.maxDiscountAmount, null),
    minOrderAmount: parseFloatValue(body.minOrderAmount, null),
    startDate: body.startDate ? parseDateValue(body.startDate, 'Ngay bat dau') : current.startDate,
    endDate: body.endDate ? parseDateValue(body.endDate, 'Ngay ket thuc') : current.endDate,
    usageLimit: body.usageLimit ? parsePositiveInt(body.usageLimit, null) : null,
    status: body.status || current.status,
  });
}

async function deletePromotion(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw httpError(404, 'Khuyen mai khong ton tai.');
  const updated = await Promotion.findByIdAndUpdate(id, { status: 'inactive' });
  if (!updated) throw httpError(404, 'Khuyen mai khong ton tai.');
}

async function assignTours(promotionId, tourIds) {
  if (!mongoose.Types.ObjectId.isValid(promotionId)) throw httpError(404, 'Khuyen mai khong ton tai.');
  const normalizedIds = normalizeIdArray(tourIds);
  await Promotion.findByIdAndUpdate(promotionId, { $addToSet: { tourIds: { $each: normalizedIds } } });
}

async function removeTour(promotionId, tourId) {
  if (!mongoose.Types.ObjectId.isValid(promotionId) || !mongoose.Types.ObjectId.isValid(tourId)) {
    throw httpError(404, 'Khuyen mai hoac tour khong ton tai.');
  }
  await Promotion.findByIdAndUpdate(promotionId, { $pull: { tourIds: new mongoose.Types.ObjectId(tourId) } });
}

module.exports = {
  getLookups,
  listPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  assignTours,
  removeTour,
};
