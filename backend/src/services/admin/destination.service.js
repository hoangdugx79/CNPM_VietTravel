const mongoose = require('mongoose');
const { Destination, Tour } = require('../../models');
const { createSlug } = require('../../utils/slug');
const { mapDestination } = require('../../db/mapper');

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function parsePositiveInt(value, fallback = 15) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

async function buildUniqueSlug(name, requestedSlug, excludeId, currentDestination) {
  const preferredSlug = (requestedSlug || '').trim();
  if (!preferredSlug && currentDestination?.slug) {
    return currentDestination.slug;
  }

  const baseSlug = createSlug(preferredSlug || name || '');
  if (!baseSlug) {
    throw httpError(400, 'Slug diem den khong hop le.');
  }

  const query = { slug: baseSlug };
  if (excludeId) query._id = { $ne: excludeId };

  const existing = await Destination.findOne(query).lean();
  return existing ? `${baseSlug}-${Date.now()}` : baseSlug;
}

async function listDestinations({ page = 1, limit = 15, search, status }) {
  const currentPage = Math.max(parsePositiveInt(page, 1), 1);
  const currentLimit = Math.max(parsePositiveInt(limit, 15), 1);
  const skip = (currentPage - 1) * currentLimit;
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
      { province: { $regex: search, $options: 'i' } },
      { region: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) query.status = status;

  const [total, destinations] = await Promise.all([
    Destination.countDocuments(query),
    Destination.find(query).sort({ createdAt: -1 }).skip(skip).limit(currentLimit).lean(),
  ]);

  const counts = await Tour.aggregate([
    { $match: { destinationIds: { $in: destinations.map((item) => item._id) }, status: 'active' } },
    { $unwind: '$destinationIds' },
    { $match: { destinationIds: { $in: destinations.map((item) => item._id) } } },
    { $group: { _id: '$destinationIds', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((item) => [item._id.toString(), item.count]));

  return {
    data: destinations.map((item) => mapDestination(item, countMap[item._id.toString()] || 0)),
    pagination: {
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.max(1, Math.ceil(total / currentLimit)),
    },
  };
}

async function createDestination(body) {
  const name = body.name?.trim();
  if (!name) throw httpError(400, 'Ten diem den la bat buoc.');

  const slug = await buildUniqueSlug(name, body.slug);
  const destination = await Destination.create({
    name,
    slug,
    description: body.description?.trim() || '',
    region: body.region?.trim() || '',
    province: body.province?.trim() || '',
    country: body.country?.trim() || 'Vietnam',
    imageUrl: body.imageUrl?.trim() || '',
    status: body.status || 'active',
  });

  return { destinationId: destination._id.toString() };
}

async function updateDestination(id, body) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw httpError(404, 'Diem den khong ton tai.');

  const currentDestination = await Destination.findById(id).lean();
  if (!currentDestination) throw httpError(404, 'Diem den khong ton tai.');

  const name = body.name?.trim();
  if (!name) throw httpError(400, 'Ten diem den la bat buoc.');

  const slug = await buildUniqueSlug(name, body.slug, id, currentDestination);

  await Destination.findByIdAndUpdate(id, {
    name,
    slug,
    description: body.description?.trim() || '',
    region: body.region?.trim() || '',
    province: body.province?.trim() || '',
    country: body.country?.trim() || 'Vietnam',
    imageUrl: body.imageUrl?.trim() || '',
    status: body.status || 'active',
  });
}

async function deleteDestination(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw httpError(404, 'Diem den khong ton tai.');

  const destination = await Destination.findById(id).lean();
  if (!destination) throw httpError(404, 'Diem den khong ton tai.');

  const tourCount = await Tour.countDocuments({ destinationIds: id });
  if (tourCount > 0) {
    throw httpError(400, 'Khong the xoa diem den dang duoc su dung trong tour.');
  }

  await Destination.findByIdAndDelete(id);
}

module.exports = { listDestinations, createDestination, updateDestination, deleteDestination };
