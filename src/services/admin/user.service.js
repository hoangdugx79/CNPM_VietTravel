const { User, Booking } = require('../../models');
const { mapUser } = require('../../db/mapper');

async function listUsers({ page = 1, limit = 15, search, role, status }) {
  const query = {};
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) query.role = role;
  if (status) query.status = status;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const [total, users] = await Promise.all([
    User.countDocuments(query),
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)).lean(),
  ]);

  const data = await Promise.all(users.map(async (user) => {
    const totalBookings = await Booking.countDocuments({ customerId: user._id });
    return { ...mapUser(user), TotalBookings: totalBookings };
  }));

  return {
    data,
    pagination: { total, page: parseInt(page, 10), limit: parseInt(limit, 10) },
  };
}

async function getUserById(id) {
  return mapUser(await User.findById(id).lean());
}

async function createUser(body) {
  const normalizedEmail = body.email?.toLowerCase().trim();
  const lookup = [{ email: normalizedEmail }];
  if (body.phone) lookup.push({ phone: body.phone });

  const existing = await User.findOne({ $or: lookup });
  if (existing) {
    return { error: { status: 409, message: 'Email hoac so dien thoai da ton tai.' } };
  }

  await User.create({
    fullName: body.fullName,
    email: normalizedEmail,
    phone: body.phone || undefined,
    authProvider: 'google',
    role: body.role || 'customer',
    gender: body.gender,
    status: body.status || 'active',
  });
}

async function updateUser(id, body) {
  await User.findByIdAndUpdate(id, {
    fullName: body.fullName,
    phone: body.phone || undefined,
    role: body.role,
    status: body.status,
    gender: body.gender,
  });
}

async function blockUser(id) {
  await User.findByIdAndUpdate(id, { status: 'blocked' });
}

module.exports = { listUsers, getUserById, createUser, updateUser, blockUser };
