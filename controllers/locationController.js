import Location from '../models/locationModel.js';
import Report from '../models/reportModel.js';
import {
  getCache,
  setCache,
  invalidateCache,
  invalidateMany,
  CACHE_KEYS,
  TTL,
} from '../utils/cache.js';

// GET all locations — cached 
const getLocations = async (req, res) => {
  try {
    // Check cache first
    const cached = getCache(CACHE_KEYS.ALL_LOCATIONS);
    if (cached) {
      return res.status(200).json(cached);
    }

    // Cache miss — fetch from DB
    const locations = await Location.find({});
    setCache(CACHE_KEYS.ALL_LOCATIONS, locations, TTL.TEN_MINUTES);
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching locations.' });
  }
};

// GET nearby — NOT cached (result differs per user location) 
const getNearbyLocations = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 10000 } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    const locations = await Location.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: 'distance',
          maxDistance: parseInt(maxDistance),
          spherical: true,
        },
      },
      { $addFields: { distanceKm: { $round: [{ $divide: ['$distance', 1000] }, 2] } } },
      { $sort: { distance: 1 } },
    ]);
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching nearby locations.' });
  }
};

// GET report clusters — NOT cached (changes as reports come in) 
const getReportClusters = async (req, res) => {
  try {
    const clusters = await Report.aggregate([
      { $match: { status: { $in: ['new', 'in progress'] } } },
      {
        $group: {
          _id: {
            lat: { $round: [{ $arrayElemAt: ['$location.coordinates', 1] }, 2] },
            lng: { $round: [{ $arrayElemAt: ['$location.coordinates', 0] }, 2] },
          },
          count: { $sum: 1 },
          reports: {
            $push: {
              id: '$_id',
              description: '$description',
              status: '$status',
              createdAt: '$createdAt',
            },
          },
          avgLat: { $avg: { $arrayElemAt: ['$location.coordinates', 1] } },
          avgLng: { $avg: { $arrayElemAt: ['$location.coordinates', 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          lat: '$avgLat',
          lng: '$avgLng',
          count: 1,
          reports: { $slice: ['$reports', 3] },
          severity: {
            $switch: {
              branches: [
                { case: { $gte: ['$count', 5] }, then: 'high' },
                { case: { $gte: ['$count', 2] }, then: 'medium' },
              ],
              default: 'low',
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);
    res.status(200).json(clusters);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching report clusters.' });
  }
};

// CREATE — invalidate cache after 
const createLocation = async (req, res) => {
  try {
    const { name, address, locationType, geometry, operatingHours } = req.body;
    if (!name || !address || !locationType || !geometry) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }
    const [lng, lat] = geometry.coordinates;
    if (isNaN(lng) || isNaN(lat) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ message: 'Invalid coordinates provided.' });
    }
    const location = new Location({
      name, address, locationType, geometry,
      operatingHours: operatingHours || 'N/A',
    });
    const saved = await location.save();
    invalidateCache(CACHE_KEYS.ALL_LOCATIONS);  // bust cache
    res.status(201).json(saved);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error while creating location.' });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { name, address, locationType, geometry, operatingHours } = req.body;
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found.' });
    }
    if (name)           location.name           = name;
    if (address)        location.address        = address;
    if (locationType)   location.locationType   = locationType;
    if (operatingHours) location.operatingHours = operatingHours;
    if (geometry) {
      const [lng, lat] = geometry.coordinates;
      if (isNaN(lng) || isNaN(lat) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({ message: 'Invalid coordinates provided.' });
      }
      location.geometry = geometry;
    }
    const updated = await location.save();
    invalidateCache(CACHE_KEYS.ALL_LOCATIONS);  // 👈 bust cache
    res.status(200).json(updated);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error while updating location.' });
  }
};

// ── DELETE — invalidate cache after ─────────────────────────────────────────
const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found.' });
    }
    await location.deleteOne();
    invalidateCache(CACHE_KEYS.ALL_LOCATIONS);  // 👈 bust cache
    res.status(200).json({ message: 'Location deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting location.' });
  }
};

export {
  getLocations,
  getNearbyLocations,
  getReportClusters,
  createLocation,
  updateLocation,
  deleteLocation,
};