const mongoose = require('mongoose');
const {
  TransportProvider,
  Vehicle,
  Driver,
  TransportRoute,
  PickupPoint,
} = require('../../models');
const {
  mapProvider,
  mapVehicle,
  mapDriver,
  mapRoute,
} = require('../../db/mapper');

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function parsePositiveInt(value, fallback = 15) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseNumber(value, fallback = 0) {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function ensureObjectId(value, message) {
  if (!mongoose.Types.ObjectId.isValid(value)) throw httpError(404, message);
}

async function getLookups() {
  const providers = await TransportProvider.find({ status: { $ne: 'inactive' } }).sort({ name: 1 }).lean();
  return {
    providers: providers.map((item) => mapProvider(item)),
  };
}

async function listProviders({ page = 1, limit = 15, search, status }) {
  const currentPage = Math.max(parsePositiveInt(page, 1), 1);
  const currentLimit = Math.max(parsePositiveInt(limit, 15), 1);
  const skip = (currentPage - 1) * currentLimit;
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { contactPersonName: { $regex: search, $options: 'i' } },
      { contactPhone: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) query.status = status;

  const [total, providers] = await Promise.all([
    TransportProvider.countDocuments(query),
    TransportProvider.find(query).sort({ createdAt: -1 }).skip(skip).limit(currentLimit).lean(),
  ]);

  const vehicleCounts = await Vehicle.aggregate([
    { $match: { providerId: { $in: providers.map((item) => item._id) } } },
    { $group: { _id: '$providerId', count: { $sum: 1 } } },
  ]);
  const vehicleMap = Object.fromEntries(vehicleCounts.map((item) => [item._id.toString(), item.count]));

  return {
    data: providers.map((item) => mapProvider({ ...item, vehicleCount: vehicleMap[item._id.toString()] || 0 })),
    pagination: {
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.max(1, Math.ceil(total / currentLimit)),
    },
  };
}

async function createProvider(body) {
  const name = body.name?.trim();
  if (!name) throw httpError(400, 'Ten nha cung cap la bat buoc.');

  await TransportProvider.create({
    name,
    type: body.type?.trim() || 'company',
    serviceTypes: body.serviceTypes?.trim() || '',
    contactPersonName: body.contactPersonName?.trim() || '',
    contactPhone: body.contactPhone?.trim() || '',
    contactEmail: body.contactEmail?.trim() || '',
    contactAddress: body.contactAddress?.trim() || '',
    status: body.status || 'active',
  });
}

async function updateProvider(id, body) {
  ensureObjectId(id, 'Nha cung cap khong ton tai.');
  const existing = await TransportProvider.findById(id).lean();
  if (!existing) throw httpError(404, 'Nha cung cap khong ton tai.');

  await TransportProvider.findByIdAndUpdate(id, {
    name: body.name?.trim() || '',
    type: body.type?.trim() || 'company',
    serviceTypes: body.serviceTypes?.trim() || '',
    contactPersonName: body.contactPersonName?.trim() || '',
    contactPhone: body.contactPhone?.trim() || '',
    contactEmail: body.contactEmail?.trim() || '',
    contactAddress: body.contactAddress?.trim() || '',
    status: body.status || existing.status || 'active',
  });
}

async function deleteProvider(id) {
  ensureObjectId(id, 'Nha cung cap khong ton tai.');
  const updated = await TransportProvider.findByIdAndUpdate(id, { status: 'inactive' });
  if (!updated) throw httpError(404, 'Nha cung cap khong ton tai.');
}

async function listVehicles({ page = 1, limit = 15, providerId, type, status, search }) {
  const currentPage = Math.max(parsePositiveInt(page, 1), 1);
  const currentLimit = Math.max(parsePositiveInt(limit, 15), 1);
  const skip = (currentPage - 1) * currentLimit;
  const query = {};

  if (providerId && mongoose.Types.ObjectId.isValid(providerId)) query.providerId = providerId;
  if (type) query.type = type;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { plateNumber: { $regex: search, $options: 'i' } },
      { vehicleCode: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
      { model: { $regex: search, $options: 'i' } },
    ];
  }

  const [total, vehicles] = await Promise.all([
    Vehicle.countDocuments(query),
    Vehicle.find(query).sort({ createdAt: -1 }).skip(skip).limit(currentLimit).lean(),
  ]);

  const providers = await TransportProvider.find({ _id: { $in: vehicles.map((item) => item.providerId).filter(Boolean) } }).lean();
  const providerMap = Object.fromEntries(providers.map((item) => [item._id.toString(), item.name]));

  return {
    data: vehicles.map((item) => mapVehicle({ ...item, providerName: providerMap[item.providerId?.toString()] })),
    pagination: {
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.max(1, Math.ceil(total / currentLimit)),
    },
  };
}

async function createVehicle(body) {
  ensureObjectId(body.providerId, 'Nha cung cap khong ton tai.');
  if (!body.plateNumber?.trim()) throw httpError(400, 'Bien so xe la bat buoc.');

  await Vehicle.create({
    providerId: body.providerId,
    vehicleCode: body.vehicleCode?.trim() || '',
    plateNumber: body.plateNumber.trim(),
    type: body.type?.trim() || '',
    brand: body.brand?.trim() || '',
    model: body.model?.trim() || '',
    seatCapacity: parsePositiveInt(body.seatCapacity, 0),
    amenities: body.amenities?.trim() || '',
    imageUrl: body.imageUrl?.trim() || '',
    status: body.status || 'available',
  });
}

async function updateVehicle(id, body) {
  ensureObjectId(id, 'Xe khong ton tai.');
  const existing = await Vehicle.findById(id).lean();
  if (!existing) throw httpError(404, 'Xe khong ton tai.');

  if (body.providerId) ensureObjectId(body.providerId, 'Nha cung cap khong ton tai.');

  await Vehicle.findByIdAndUpdate(id, {
    providerId: body.providerId || existing.providerId,
    vehicleCode: body.vehicleCode?.trim() || existing.vehicleCode || '',
    plateNumber: body.plateNumber?.trim() || existing.plateNumber,
    type: body.type?.trim() || existing.type || '',
    brand: body.brand?.trim() || '',
    model: body.model?.trim() || '',
    seatCapacity: parsePositiveInt(body.seatCapacity, existing.seatCapacity || 0),
    amenities: body.amenities?.trim() || '',
    status: body.status || existing.status,
    imageUrl: body.imageUrl?.trim() || '',
  });
}

async function deleteVehicle(id) {
  ensureObjectId(id, 'Xe khong ton tai.');
  const updated = await Vehicle.findByIdAndUpdate(id, { status: 'inactive' });
  if (!updated) throw httpError(404, 'Xe khong ton tai.');
}

async function listDrivers({ page = 1, limit = 15, providerId, status, search }) {
  const currentPage = Math.max(parsePositiveInt(page, 1), 1);
  const currentLimit = Math.max(parsePositiveInt(limit, 15), 1);
  const skip = (currentPage - 1) * currentLimit;
  const query = {};

  if (providerId && mongoose.Types.ObjectId.isValid(providerId)) query.providerId = providerId;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { licenseNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const [total, drivers] = await Promise.all([
    Driver.countDocuments(query),
    Driver.find(query).sort({ createdAt: -1 }).skip(skip).limit(currentLimit).lean(),
  ]);

  const providers = await TransportProvider.find({ _id: { $in: drivers.map((item) => item.providerId).filter(Boolean) } }).lean();
  const providerMap = Object.fromEntries(providers.map((item) => [item._id.toString(), item.name]));

  return {
    data: drivers.map((item) => mapDriver({ ...item, providerName: providerMap[item.providerId?.toString()] })),
    pagination: {
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.max(1, Math.ceil(total / currentLimit)),
    },
  };
}

async function createDriver(body) {
  ensureObjectId(body.providerId, 'Nha cung cap khong ton tai.');
  if (!body.fullName?.trim()) throw httpError(400, 'Ten tai xe la bat buoc.');

  await Driver.create({
    providerId: body.providerId,
    fullName: body.fullName.trim(),
    phone: body.phone?.trim() || '',
    email: body.email?.trim() || '',
    licenseNumber: body.licenseNumber?.trim() || '',
    licenseClass: body.licenseClass?.trim() || '',
    experienceYears: body.experienceYears ? parsePositiveInt(body.experienceYears, 0) : null,
    status: body.status || 'available',
  });
}

async function updateDriver(id, body) {
  ensureObjectId(id, 'Tai xe khong ton tai.');
  const existing = await Driver.findById(id).lean();
  if (!existing) throw httpError(404, 'Tai xe khong ton tai.');

  if (body.providerId) ensureObjectId(body.providerId, 'Nha cung cap khong ton tai.');

  await Driver.findByIdAndUpdate(id, {
    providerId: body.providerId || existing.providerId,
    fullName: body.fullName?.trim() || existing.fullName,
    phone: body.phone?.trim() || '',
    email: body.email?.trim() || '',
    licenseNumber: body.licenseNumber?.trim() || '',
    licenseClass: body.licenseClass?.trim() || '',
    experienceYears: body.experienceYears ? parsePositiveInt(body.experienceYears, 0) : null,
    status: body.status || existing.status,
  });
}

async function deleteDriver(id) {
  ensureObjectId(id, 'Tai xe khong ton tai.');
  const updated = await Driver.findByIdAndUpdate(id, { status: 'inactive' });
  if (!updated) throw httpError(404, 'Tai xe khong ton tai.');
}

async function listRoutes({ page = 1, limit = 15, status, search }) {
  const currentPage = Math.max(parsePositiveInt(page, 1), 1);
  const currentLimit = Math.max(parsePositiveInt(limit, 15), 1);
  const skip = (currentPage - 1) * currentLimit;
  const query = {};

  if (status) query.status = status;
  if (search) {
    query.$or = [
      { routeCode: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { fromName: { $regex: search, $options: 'i' } },
      { toName: { $regex: search, $options: 'i' } },
    ];
  }

  const [total, routes] = await Promise.all([
    TransportRoute.countDocuments(query),
    TransportRoute.find(query).sort({ createdAt: -1 }).skip(skip).limit(currentLimit).lean(),
  ]);

  const pickupCounts = await PickupPoint.aggregate([
    { $match: { routeId: { $in: routes.map((item) => item._id) } } },
    { $group: { _id: '$routeId', count: { $sum: 1 } } },
  ]);
  const pickupMap = Object.fromEntries(pickupCounts.map((item) => [item._id.toString(), item.count]));

  return {
    data: routes.map((item) => mapRoute({ ...item, pickupCount: pickupMap[item._id.toString()] || 0 })),
    pagination: {
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.max(1, Math.ceil(total / currentLimit)),
    },
  };
}

async function getRoutePickups(routeId) {
  ensureObjectId(routeId, 'Tuyen duong khong ton tai.');
  return PickupPoint.find({ routeId }).sort({ pickupTimeOffsetMinutes: 1 }).lean();
}

async function createRoute(body) {
  if (!body.routeCode?.trim()) throw httpError(400, 'Ma tuyen duong la bat buoc.');
  if (!body.name?.trim()) throw httpError(400, 'Ten tuyen duong la bat buoc.');

  await TransportRoute.create({
    routeCode: body.routeCode.trim(),
    name: body.name.trim(),
    fromName: body.fromName?.trim() || '',
    fromType: body.fromType?.trim() || '',
    fromAddress: body.fromAddress?.trim() || '',
    toName: body.toName?.trim() || '',
    toType: body.toType?.trim() || '',
    toAddress: body.toAddress?.trim() || '',
    distanceKm: parseNumber(body.distanceKm, 0),
    estimatedDurationMinutes: parsePositiveInt(body.estimatedDurationMinutes, 0),
    status: body.status || 'active',
  });
}

async function updateRoute(id, body) {
  ensureObjectId(id, 'Tuyen duong khong ton tai.');
  const existing = await TransportRoute.findById(id).lean();
  if (!existing) throw httpError(404, 'Tuyen duong khong ton tai.');

  await TransportRoute.findByIdAndUpdate(id, {
    routeCode: body.routeCode?.trim() || existing.routeCode,
    name: body.name?.trim() || existing.name,
    fromName: body.fromName?.trim() || '',
    fromType: body.fromType?.trim() || '',
    fromAddress: body.fromAddress?.trim() || '',
    toName: body.toName?.trim() || '',
    toType: body.toType?.trim() || '',
    toAddress: body.toAddress?.trim() || '',
    distanceKm: parseNumber(body.distanceKm, 0),
    estimatedDurationMinutes: parsePositiveInt(body.estimatedDurationMinutes, 0),
    status: body.status || existing.status,
  });
}

async function deleteRoute(id) {
  ensureObjectId(id, 'Tuyen duong khong ton tai.');
  const updated = await TransportRoute.findByIdAndUpdate(id, { status: 'inactive' });
  if (!updated) throw httpError(404, 'Tuyen duong khong ton tai.');
}

async function createPickupPoint(routeId, body) {
  ensureObjectId(routeId, 'Tuyen duong khong ton tai.');
  if (!body.name?.trim()) throw httpError(400, 'Ten diem don la bat buoc.');

  await PickupPoint.create({
    routeId,
    code: body.code?.trim() || '',
    name: body.name.trim(),
    address: body.address?.trim() || '',
    pickupTimeOffsetMinutes: parsePositiveInt(body.pickupTimeOffsetMinutes, 0),
    status: body.status || 'active',
  });
}

async function updatePickupPoint(id, body) {
  ensureObjectId(id, 'Diem don khong ton tai.');
  const existing = await PickupPoint.findById(id).lean();
  if (!existing) throw httpError(404, 'Diem don khong ton tai.');

  await PickupPoint.findByIdAndUpdate(id, {
    code: body.code?.trim() || '',
    name: body.name?.trim() || existing.name,
    address: body.address?.trim() || '',
    pickupTimeOffsetMinutes: parsePositiveInt(body.pickupTimeOffsetMinutes, 0),
    status: body.status || existing.status,
  });
}

async function deletePickupPoint(id) {
  ensureObjectId(id, 'Diem don khong ton tai.');
  const deleted = await PickupPoint.findByIdAndDelete(id);
  if (!deleted) throw httpError(404, 'Diem don khong ton tai.');
}

module.exports = {
  getLookups,
  listProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  listVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  listDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  listRoutes,
  getRoutePickups,
  createRoute,
  updateRoute,
  deleteRoute,
  createPickupPoint,
  updatePickupPoint,
  deletePickupPoint,
};
