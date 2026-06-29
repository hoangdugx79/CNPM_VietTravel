const { Destination, TourCategory, Tour } = require('../models');
const { mapDestination, mapCategory } = require('../db/mapper');

async function getDestinations() {
  const dests = await Destination.find({ status: 'active' }).lean();
  const counts = await Tour.aggregate([
    { $match: { status: 'active' } },
    { $unwind: '$destinationIds' },
    { $group: { _id: '$destinationIds', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));
  return dests
    .map((d) => mapDestination(d, countMap[d._id.toString()] || 0))
    .sort((a, b) => b.TourCount - a.TourCount || a.Name.localeCompare(b.Name));
}

async function getCategories() {
  const cats = await TourCategory.find({ status: 'active' }).lean();
  const counts = await Tour.aggregate([
    { $match: { status: 'active' } },
    { $unwind: '$categoryIds' },
    { $group: { _id: '$categoryIds', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));
  return cats
    .map((c) => mapCategory(c, countMap[c._id.toString()] || 0))
    .sort((a, b) => b.TourCount - a.TourCount);
}

module.exports = { getDestinations, getCategories };
