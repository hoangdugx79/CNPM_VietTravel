const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, unique: true, sparse: true, trim: true },
  passwordHash: String,
  googleId: { type: String, unique: true, sparse: true },
  authProvider: { type: String, default: 'google' },
  role: { type: String, enum: ['customer', 'staff', 'admin', 'operator', 'guide', 'driver'], default: 'customer' },
  gender: String,
  dateOfBirth: Date,
  province: String,
  district: String,
  ward: String,
  addressDetail: String,
  avatarUrl: String,
  lastLoginAt: Date,
  status: { type: String, default: 'active' },
}, { timestamps: true });

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  type: String,
  country: { type: String, default: 'Vietnam' },
  province: String,
  region: String,
  description: String,
  imageUrl: String,
  status: { type: String, default: 'active' },
}, { timestamps: true });

const tourCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  status: { type: String, default: 'active' },
}, { timestamps: true });

const tourSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  departurePlaceName: String,
  durationDays: { type: Number, required: true },
  durationNights: { type: Number, default: 0 },
  basePrice: { type: Number, required: true },
  shortDescription: String,
  description: String,
  includedServices: String,
  excludedServices: String,
  cancellationPolicy: String,
  childPolicy: String,
  paymentPolicy: String,
  mainImageUrl: String,
  tags: String,
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  status: { type: String, default: 'active' },
  categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TourCategory' }],
  destinationIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const tourItinerarySchema = new mongoose.Schema({
  tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
  dayNumber: Number,
  title: String,
  activities: String,
  breakfast: { type: Boolean, default: false },
  lunch: { type: Boolean, default: false },
  dinner: { type: Boolean, default: false },
  accommodation: String,
});

const tourDepartureSchema = new mongoose.Schema({
  tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
  departureCode: { type: String, required: true, unique: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  capacity: { type: Number, required: true },
  bookedCount: { type: Number, default: 0 },
  holdCount: { type: Number, default: 0 },
  adultPrice: Number,
  childPrice: Number,
  infantPrice: { type: Number, default: 0 },
  status: { type: String, default: 'open' },
}, { timestamps: true });

const transportProviderSchema = new mongoose.Schema({
  name: String,
  type: { type: String, default: 'company' },
  serviceTypes: String,
  taxCode: String,
  contactPersonName: String,
  contactPhone: String,
  contactEmail: String,
  contactAddress: String,
  status: { type: String, default: 'active' },
}, { timestamps: true });

const vehicleSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportProvider' },
  vehicleCode: String,
  plateNumber: String,
  type: String,
  brand: String,
  model: String,
  seatCapacity: Number,
  amenities: String,
  imageUrl: String,
  status: { type: String, default: 'available' },
}, { timestamps: true });

const driverSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportProvider' },
  fullName: String,
  phone: String,
  email: String,
  licenseNumber: String,
  licenseClass: String,
  experienceYears: Number,
  status: { type: String, default: 'available' },
}, { timestamps: true });

const transportRouteSchema = new mongoose.Schema({
  routeCode: String,
  name: String,
  fromName: String,
  fromType: String,
  fromAddress: String,
  toName: String,
  toType: String,
  toAddress: String,
  distanceKm: Number,
  estimatedDurationMinutes: Number,
  status: { type: String, default: 'active' },
}, { timestamps: true });

const pickupPointSchema = new mongoose.Schema({
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportRoute' },
  code: String,
  name: String,
  address: String,
  pickupTimeOffsetMinutes: { type: Number, default: 0 },
  status: { type: String, default: 'active' },
});

const transportServiceSchema = new mongoose.Schema({
  departureId: { type: mongoose.Schema.Types.ObjectId, ref: 'TourDeparture' },
  tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportProvider' },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportRoute' },
  serviceCode: String,
  name: String,
  mode: String,
  serviceType: String,
  adultPrice: { type: Number, default: 0 },
  childPrice: { type: Number, default: 0 },
  seatCapacity: Number,
  bookedSeats: { type: Number, default: 0 },
  allowCustomerSelect: { type: Boolean, default: true },
  status: { type: String, default: 'open' },
}, { timestamps: true });

const bookingSchema = new mongoose.Schema({
  bookingCode: { type: String, required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' },
  departureId: { type: mongoose.Schema.Types.ObjectId, ref: 'TourDeparture' },
  customerFullName: String,
  customerPhone: String,
  customerEmail: String,
  tourCodeSnapshot: String,
  tourTitleSnapshot: String,
  startDateSnapshot: Date,
  endDateSnapshot: Date,
  adultQuantity: { type: Number, default: 0 },
  childQuantity: { type: Number, default: 0 },
  infantQuantity: { type: Number, default: 0 },
  tourAmount: { type: Number, default: 0 },
  transportAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, default: 'unpaid' },
  status: { type: String, default: 'pending' },
  note: String,
  promoCode: String,
  travelers: [{ fullName: String, travelerType: String }],
  transport: {
    transportServiceId: mongoose.Schema.Types.ObjectId,
    serviceName: String,
    mode: String,
    pickupPointName: String,
    doorToDoorAddress: String,
    seatNumbers: String,
    extraFee: Number,
  },
}, { timestamps: true });

const paymentSchema = new mongoose.Schema({
  paymentCode: { type: String, unique: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  method: String,
  status: { type: String, default: 'success' },
  paidAt: Date,
  note: String,
}, { timestamps: true });

const promotionSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  name: String,
  description: String,
  discountType: { type: String, enum: ['percent', 'fixed'] },
  discountValue: Number,
  maxDiscountAmount: Number,
  minOrderAmount: Number,
  startDate: Date,
  endDate: Date,
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  tourIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tour' }],
  status: { type: String, default: 'active' },
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
  tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: Number,
  comment: String,
  imageUrl: String,
  status: { type: String, default: 'visible' },
}, { timestamps: true });

module.exports = {
  User: mongoose.models.User || mongoose.model('User', userSchema),
  Destination: mongoose.models.Destination || mongoose.model('Destination', destinationSchema),
  TourCategory: mongoose.models.TourCategory || mongoose.model('TourCategory', tourCategorySchema),
  Tour: mongoose.models.Tour || mongoose.model('Tour', tourSchema),
  TourItinerary: mongoose.models.TourItinerary || mongoose.model('TourItinerary', tourItinerarySchema),
  TourDeparture: mongoose.models.TourDeparture || mongoose.model('TourDeparture', tourDepartureSchema),
  TransportProvider: mongoose.models.TransportProvider || mongoose.model('TransportProvider', transportProviderSchema),
  Vehicle: mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema),
  Driver: mongoose.models.Driver || mongoose.model('Driver', driverSchema),
  TransportRoute: mongoose.models.TransportRoute || mongoose.model('TransportRoute', transportRouteSchema),
  PickupPoint: mongoose.models.PickupPoint || mongoose.model('PickupPoint', pickupPointSchema),
  TransportService: mongoose.models.TransportService || mongoose.model('TransportService', transportServiceSchema),
  Booking: mongoose.models.Booking || mongoose.model('Booking', bookingSchema),
  Payment: mongoose.models.Payment || mongoose.model('Payment', paymentSchema),
  Promotion: mongoose.models.Promotion || mongoose.model('Promotion', promotionSchema),
  Review: mongoose.models.Review || mongoose.model('Review', reviewSchema),
};
