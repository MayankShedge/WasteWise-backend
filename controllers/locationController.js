import Location from '../models/locationModel.js';

// @desc    Fetch all locations
// @route   GET /api/locations
const getLocations = async (req, res) => {
  try {
    const locations = await Location.find({});
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching locations.' });
  }
};

// @desc    Fetch locations near user (NEW)
// @route   GET /api/locations/nearby?lat=19.0330&lng=73.0297&maxDistance=5000
const getNearbyLocations = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 10000 } = req.query; // Default 10km radius
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const locations = await Location.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          distanceField: 'distance',
          maxDistance: parseInt(maxDistance),
          spherical: true
        }
      },
      {
        $addFields: {
          distanceKm: { $round: [{ $divide: ['$distance', 1000] }, 2] }
        }
      },
      { $sort: { distance: 1 } }
    ]);

    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching nearby locations.' });
  }
};

export { getLocations, getNearbyLocations };
