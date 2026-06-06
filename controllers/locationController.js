import Location from '../models/locationModel.js';
import Report from '../models/reportModel.js';    

const getLocations = async (req, res) => {
  try {
    const locations = await Location.find({});
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching locations.' });
  }
};

const getNearbyLocations = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 10000 } = req.query;
    
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

const getReportClusters = async (req, res) => {
  try {
    const clusters = await Report.aggregate([
      { $match: { status: { $in: ['new', 'in-progress'] } } },
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
            }
          },
          avgLat: { $avg: { $arrayElemAt: ['$location.coordinates', 1] } },
          avgLng: { $avg: { $arrayElemAt: ['$location.coordinates', 0] } },
        }
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
              default: 'low'
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json(clusters);
  } catch (error) {
    console.error('Cluster error:', error);
    res.status(500).json({ message: 'Server error while fetching report clusters.' });
  }
};

export { getLocations, getNearbyLocations, getReportClusters };