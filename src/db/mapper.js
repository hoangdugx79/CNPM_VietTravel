function id(doc) {
  if (!doc) return null;
  if (doc._id) return doc._id.toString();
  return doc.toString();
}

function mapUser(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    UserId: id(o),
    FullName: o.fullName,
    Email: o.email,
    Phone: o.phone,
    GoogleId: o.googleId,
    AuthProvider: o.authProvider,
    Role: o.role,
    Gender: o.gender,
    DateOfBirth: o.dateOfBirth,
    Province: o.province,
    District: o.district,
    Ward: o.ward,
    AddressDetail: o.addressDetail,
    AvatarUrl: o.avatarUrl,
    LastLoginAt: o.lastLoginAt,
    Status: o.status,
    CreatedAt: o.createdAt,
    UpdatedAt: o.updatedAt,
  };
}

function mapDestination(doc, tourCount = 0) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    DestinationId: id(o),
    Name: o.name,
    Slug: o.slug,
    Type: o.type,
    Country: o.country,
    Province: o.province,
    Region: o.region,
    Description: o.description,
    ImageUrl: o.imageUrl,
    Status: o.status,
    TourCount: tourCount || o.tourCount || 0,
    CreatedAt: o.createdAt,
  };
}

function mapCategory(doc, tourCount = 0) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    CategoryId: id(o),
    Name: o.name,
    Slug: o.slug,
    Description: o.description,
    Status: o.status,
    TourCount: tourCount || o.tourCount || 0,
  };
}

function mapTour(doc, extras = {}) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    TourId: id(o),
    Code: o.code,
    Title: o.title,
    Slug: o.slug,
    DeparturePlaceName: o.departurePlaceName,
    DurationDays: o.durationDays,
    DurationNights: o.durationNights,
    BasePrice: o.basePrice,
    ShortDescription: o.shortDescription,
    Description: o.description,
    IncludedServices: o.includedServices,
    ExcludedServices: o.excludedServices,
    CancellationPolicy: o.cancellationPolicy,
    ChildPolicy: o.childPolicy,
    PaymentPolicy: o.paymentPolicy,
    MainImageUrl: o.mainImageUrl,
    Tags: o.tags,
    RatingAvg: o.ratingAvg,
    RatingCount: o.ratingCount,
    Status: o.status,
    CreatedAt: o.createdAt,
    DestinationNames: extras.destinationNames,
    MinDeparturePrice: extras.minDeparturePrice,
    NextDeparture: extras.nextDeparture,
    TotalBookings: extras.totalBookings,
  };
}

function mapDeparture(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    DepartureId: id(o),
    TourId: o.tourId?.toString(),
    DepartureCode: o.departureCode,
    StartDate: o.startDate,
    EndDate: o.endDate,
    Capacity: o.capacity,
    BookedCount: o.bookedCount,
    HoldCount: o.holdCount,
    AdultPrice: o.adultPrice,
    ChildPrice: o.childPrice,
    InfantPrice: o.infantPrice,
    Status: o.status,
    AvailableSeats: o.capacity - o.bookedCount - o.holdCount,
    TourTitle: o.tourTitle,
    TourCode: o.tourCode,
    Available: o.capacity - o.bookedCount - o.holdCount,
  };
}

function mapItinerary(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    ItineraryId: id(o),
    TourId: o.tourId?.toString(),
    DayNumber: o.dayNumber,
    Title: o.title,
    Activities: o.activities,
    Breakfast: o.breakfast,
    Lunch: o.lunch,
    Dinner: o.dinner,
    Accommodation: o.accommodation,
  };
}

function mapBooking(doc, extras = {}) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    BookingId: id(o),
    BookingCode: o.bookingCode,
    CustomerId: o.customerId?.toString(),
    TourId: o.tourId?.toString(),
    DepartureId: o.departureId?.toString(),
    CustomerFullName: o.customerFullName,
    CustomerPhone: o.customerPhone,
    CustomerEmail: o.customerEmail,
    TourTitleSnapshot: o.tourTitleSnapshot,
    StartDateSnapshot: o.startDateSnapshot,
    EndDateSnapshot: o.endDateSnapshot,
    AdultQuantity: o.adultQuantity,
    ChildQuantity: o.childQuantity,
    InfantQuantity: o.infantQuantity,
    TotalAmount: o.totalAmount,
    PaidAmount: o.paidAmount,
    RemainingAmount: o.remainingAmount,
    PaymentStatus: o.paymentStatus,
    Status: o.status,
    Note: o.note,
    CreatedAt: o.createdAt,
    MainImageUrl: extras.mainImageUrl,
    TourSlug: extras.tourSlug,
    TransportName: o.transport?.serviceName,
    travelers: o.travelers,
    transport: o.transport,
    payments: extras.payments,
  };
}

function mapPromotion(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    PromotionId: id(o),
    Code: o.code,
    Name: o.name,
    Description: o.description,
    DiscountType: o.discountType,
    DiscountValue: o.discountValue,
    MaxDiscountAmount: o.maxDiscountAmount,
    MinOrderAmount: o.minOrderAmount,
    StartDate: o.startDate,
    EndDate: o.endDate,
    UsageLimit: o.usageLimit,
    UsedCount: o.usedCount,
    Status: o.status,
    TourCount: o.tourIds?.length || 0,
  };
}

function mapProvider(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    ProviderId: id(o),
    Name: o.name,
    Type: o.type,
    ServiceTypes: o.serviceTypes,
    ContactPersonName: o.contactPersonName,
    ContactPhone: o.contactPhone,
    ContactEmail: o.contactEmail,
    ContactAddress: o.contactAddress,
    Status: o.status,
    VehicleCount: o.vehicleCount || 0,
  };
}

function mapVehicle(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    VehicleId: id(o),
    ProviderId: o.providerId?.toString(),
    ProviderName: o.providerName,
    VehicleCode: o.vehicleCode,
    PlateNumber: o.plateNumber,
    Type: o.type,
    Brand: o.brand,
    Model: o.model,
    SeatCapacity: o.seatCapacity,
    Amenities: o.amenities,
    ImageUrl: o.imageUrl,
    Status: o.status,
  };
}

function mapDriver(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    DriverId: id(o),
    ProviderId: o.providerId?.toString(),
    ProviderName: o.providerName,
    FullName: o.fullName,
    Phone: o.phone,
    Email: o.email,
    LicenseNumber: o.licenseNumber,
    LicenseClass: o.licenseClass,
    ExperienceYears: o.experienceYears,
    Status: o.status,
  };
}

function mapRoute(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    RouteId: id(o),
    RouteCode: o.routeCode,
    Name: o.name,
    FromName: o.fromName,
    FromType: o.fromType,
    FromAddress: o.fromAddress,
    ToName: o.toName,
    ToType: o.toType,
    ToAddress: o.toAddress,
    DistanceKm: o.distanceKm,
    EstimatedDurationMinutes: o.estimatedDurationMinutes,
    Status: o.status,
    PickupCount: o.pickupCount || 0,
  };
}

function mapTransportService(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    TransportServiceId: id(o),
    DepartureId: o.departureId?.toString(),
    TourId: o.tourId?.toString(),
    ProviderId: o.providerId?.toString(),
    Name: o.name,
    Mode: o.mode,
    ServiceType: o.serviceType,
    AdultPrice: o.adultPrice,
    ChildPrice: o.childPrice,
    SeatCapacity: o.seatCapacity,
    BookedSeats: o.bookedSeats,
    Status: o.status,
    AllowCustomerSelect: o.allowCustomerSelect,
    ProviderName: o.providerName,
    PlateNumber: o.plateNumber,
    Brand: o.brand,
    Model: o.model,
    DriverName: o.driverName,
    TourTitle: o.tourTitle,
    DepartureCode: o.departureCode,
    AvailableSeats: o.seatCapacity - o.bookedSeats,
  };
}

module.exports = {
  id, mapUser, mapDestination, mapCategory, mapTour, mapDeparture,
  mapItinerary, mapBooking, mapPromotion, mapProvider, mapVehicle,
  mapDriver, mapRoute, mapTransportService,
};
