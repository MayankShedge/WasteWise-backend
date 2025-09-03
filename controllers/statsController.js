import User from '../models/userModel.js';
import Report from '../models/reportModel.js';
import ScanHistory from '../models/scanHistoryModel.js';

// @desc    Get dashboard analytics
// @route   GET /api/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        // 1. Get Key Metrics
        const totalUsers = await User.countDocuments({});
        const totalReports = await Report.countDocuments({});
        const totalScans = await ScanHistory.countDocuments({});

        // 2. Scan Category Breakdown (Pie Chart)
        const categoryStats = await ScanHistory.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $project: { _id: 0, category: '$_id', count: 1 } }
        ]);

        // 3. Scans per Day for the last 7 days (Bar Chart)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyScans = await ScanHistory.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } } // Sort by date
        ]);

        res.json({
            keyMetrics: {
                totalUsers,
                totalReports,
                totalScans
            },
            categoryStats,
            dailyScans
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Server error while fetching stats.' });
    }
};

export { getDashboardStats };
