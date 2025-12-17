import ScanHistory from '../models/scanHistoryModel.js';

const logScan = async (req, res) => {
  const { 
    item, 
    category, 
    confidence, 
    method, 
    detectedItem, 
    modelVersion 
  } = req.body;

  if (!item || !category) {
    return res.status(400).json({ message: 'Item and category are required.' });
  }

  try {
    const newScan = new ScanHistory({
      user: req.user._id, 
      item,
      category,
      confidence: confidence ? parseFloat(confidence) : null,
      method: method || 'Legacy',
      detectedItem: detectedItem || null,
      modelVersion: modelVersion || 'v1.0'
    });

    const savedScan = await newScan.save();
    res.status(201).json(savedScan);
  } catch (error) {
    console.error('Error logging scan:', error);
    res.status(500).json({ message: 'Server error while logging scan.' });
  }
};

const getScanHistory = async (req, res) => {
  try {
    const history = await ScanHistory.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Server error while fetching history.' });
  }
};

const getEnhancedAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const methodStats = await ScanHistory.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$method',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const categoryStats = await ScanHistory.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' },
          methods: { $addToSet: '$method' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await ScanHistory.aggregate([
      { 
        $match: { 
          user: userId, 
          createdAt: { $gte: sevenDaysAgo } 
        } 
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalScans = await ScanHistory.countDocuments({ user: userId });
    const totalThisWeek = await ScanHistory.countDocuments({ 
      user: userId, 
      createdAt: { $gte: sevenDaysAgo } 
    });

    res.json({
      methodStats,
      categoryStats,
      recentActivity,
      summary: {
        totalScans,
        totalThisWeek,
        avgConfidence: await ScanHistory.aggregate([
          { $match: { user: userId, confidence: { $ne: null } } },
          { $group: { _id: null, avgConfidence: { $avg: '$confidence' } } }
        ]).then(result => result[0]?.avgConfidence || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching enhanced analytics:', error);
    res.status(500).json({ message: 'Failed to fetch enhanced analytics.' });
  }
};

export { logScan, getScanHistory, getEnhancedAnalytics };
