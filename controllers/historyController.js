import ScanHistory from '../models/scanHistoryModel.js';

// @desc    Log a new scan event
// @route   POST /api/history
// @access  Private
const logScan = async (req, res) => {
  const { item, category } = req.body;

  if (!item || !category) {
    return res.status(400).json({ message: 'Item and category are required.' });
  }

  try {
    const newScan = new ScanHistory({
      user: req.user._id, // req.user comes from our 'protect' middleware
      item,
      category,
    });

    const savedScan = await newScan.save();
    res.status(201).json(savedScan);
  } catch (error) {
    res.status(500).json({ message: 'Server error while logging scan.' });
  }
};

// @desc    Get a user's scan history
// @route   GET /api/history
// @access  Private
const getScanHistory = async (req, res) => {
  try {
    // Find all scans for the logged-in user and sort by newest first
    const history = await ScanHistory.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching history.' });
  }
};

export { logScan, getScanHistory };
