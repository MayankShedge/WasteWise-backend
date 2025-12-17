import { guideData } from '../data/guideData.js';
import Schedule from '../models/ScheduleModel.js'; 


const getGuideData = async (req, res) => { 
  try {
    const schedules = await Schedule.find({});
    
    res.status(200).json({
      wetWaste: guideData.wetWaste,
      dryWaste: guideData.dryWaste,
      schedules: schedules, 
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching guide data.' });
  }
};

export { getGuideData };
