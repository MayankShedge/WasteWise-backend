// backend/controllers/locationController.js

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

export { getLocations };