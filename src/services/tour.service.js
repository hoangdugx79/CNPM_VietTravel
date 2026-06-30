const {
  Tour, TourDeparture, TourItinerary, TourCategory, Destination,
  TransportService, PickupPoint, TransportRoute, Review, User,
} = require('../models');
const { mapTour, mapDeparture, mapItinerary, mapDestination, mapCategory, mapTransportService } = require('../db/mapper');

async function getDestinationNames(tour) {
  if (!tour.destinationIds?.length) return '';
  const dests = await Destination.find({ _id: { $in: tour.destinationIds } }).select('name').lean();
  return dests.map((d) => d.name).join(', ');
}

async function enrichTour(tour) {
  const now = new Date();
  const dep = await TourDeparture.findOne({ tourId: tour._id, status: 'open', startDate: { $gte: now } })
    .sort({ startDate: 1 }).lean();
  const destinationNames = await getDestinationNames(tour);
  return mapTour(tour, {
    destinationNames,
    minDeparturePrice: dep?.adultPrice,
    nextDeparture: dep?.startDate,
  });
}

async function getTours(filters) {
  const { page = 1, limit = 12, category, destination, minPrice, maxPrice, duration, search, sort = 'newest' } = filters;
  const query = { status: 'active' };

  if (search) {
    const destinationMatches = await Destination.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { province: { $regex: search, $options: 'i' } },
        { region: { $regex: search, $options: 'i' } },
      ],
    }).select('_id').lean();

    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
      { shortDescription: { $regex: search, $options: 'i' } },
      { departurePlaceName: { $regex: search, $options: 'i' } },
    ];

    if (destinationMatches.length) {
      query.$or.push({ destinationIds: { $in: destinationMatches.map((item) => item._id) } });
    }
  }
  if (minPrice) query.basePrice = { ...query.basePrice, $gte: parseFloat(minPrice) };
  if (maxPrice) query.basePrice = { ...query.basePrice, $lte: parseFloat(maxPrice) };
  if (duration === '1-3') query.durationDays = { $gte: 1, $lte: 3 };
  else if (duration === '4-7') query.durationDays = { $gte: 4, $lte: 7 };
  else if (duration === '8+') query.durationDays = { $gte: 8 };

  if (category) {
    const cat = await TourCategory.findOne({ slug: category }).lean();
    if (cat) query.categoryIds = cat._id;
  }
  if (destination) {
    const dest = await Destination.findOne({ slug: destination }).lean();
    if (dest) query.destinationIds = dest._id;
  }

  let sortObj = { createdAt: -1 };
  if (sort === 'price_asc') sortObj = { basePrice: 1 };
  else if (sort === 'price_desc') sortObj = { basePrice: -1 };
  else if (sort === 'rating') sortObj = { ratingAvg: -1 };
  else if (sort === 'popular') sortObj = { ratingCount: -1 };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [total, tours] = await Promise.all([
    Tour.countDocuments(query),
    Tour.find(query).sort(sortObj).skip(skip).limit(parseInt(limit)).lean(),
  ]);

  const data = await Promise.all(tours.map(enrichTour));
  return { data, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } };
}

async function getFeaturedTours() {
  const tours = await Tour.find({ status: 'active' }).sort({ ratingAvg: -1, ratingCount: -1 }).limit(6).lean();
  return Promise.all(tours.map(enrichTour));
}

async function getTourBySlug(slug) {
  const tour = await Tour.findOne({ slug, status: 'active' }).lean();
  if (!tour) return null;

  const [itineraries, departures, categories, destinations, reviews] = await Promise.all([
    TourItinerary.find({ tourId: tour._id }).sort({ dayNumber: 1 }).lean(),
    TourDeparture.find({ tourId: tour._id, status: 'open', startDate: { $gte: new Date() } }).sort({ startDate: 1 }).lean(),
    TourCategory.find({ _id: { $in: tour.categoryIds || [] } }).lean(),
    Destination.find({ _id: { $in: tour.destinationIds || [] } }).lean(),
    Review.find({ tourId: tour._id, status: 'visible' }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const reviewUsers = await User.find({ _id: { $in: reviews.map((r) => r.customerId) } }).lean();
  const userMap = Object.fromEntries(reviewUsers.map((u) => [u._id.toString(), u]));

  return {
    ...mapTour(tour),
    itineraries: itineraries.map(mapItinerary),
    departures: departures.map(mapDeparture),
    categories: categories.map((c) => mapCategory(c)),
    destinations: destinations.map((d, i) => ({ ...mapDestination(d), SortOrder: i + 1 })),
    reviews: reviews.map((r) => ({
      Rating: r.rating,
      Comment: r.comment,
      CreatedAt: r.createdAt,
      FullName: userMap[r.customerId?.toString()]?.fullName,
      AvatarUrl: userMap[r.customerId?.toString()]?.avatarUrl,
    })),
  };
}

async function getTransportOptions(tourId, departureId) {
  const services = await TransportService.find({
    tourId,
    departureId,
    status: 'open',
    allowCustomerSelect: true,
  }).lean();

  const pickupPoints = await PickupPoint.find({ status: 'active' }).lean();

  return {
    services: services.map(mapTransportService),
    pickupPoints: pickupPoints.map((p) => ({ ...p, PickupPointId: p._id.toString(), RouteName: '' })),
  };
}

module.exports = { getTours, getFeaturedTours, getTourBySlug, getTransportOptions };
