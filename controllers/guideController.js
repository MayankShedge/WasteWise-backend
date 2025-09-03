import { guideData } from '../data/guideData.js';
import Schedule from '../models/ScheduleModel.js'; // 1. Import Schedule model

// @desc    Fetch segregation guide and schedule
// @route   GET /api/guide
const getGuideData = async (req, res) => { // 2. Make the function async
  try {
    // 3. Fetch schedules dynamically from the database
    const schedules = await Schedule.find({});
    
    // 4. Combine static data with dynamic schedules and send
    res.status(200).json({
      wetWaste: guideData.wetWaste,
      dryWaste: guideData.dryWaste,
      schedules: schedules, // Use live data from the DB
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching guide data.' });
  }
};

export { getGuideData };
