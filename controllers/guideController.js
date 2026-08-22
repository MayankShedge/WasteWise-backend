import { guideData } from '../data/guideData.js';
import Schedule from '../models/ScheduleModel.js';
import {
  getCache,
  setCache,
  CACHE_KEYS,
  TTL,
} from '../utils/cache.js';

const getGuideData = async (req, res) => {
  try {
    const cached = getCache(CACHE_KEYS.GUIDE_DATA);
    if (cached) {
      return res.status(200).json(cached);
    }

    const schedules = await Schedule.find({});
    const response = {
      wetWaste:  guideData.wetWaste,
      dryWaste:  guideData.dryWaste,
      schedules: schedules,
    };

    // Guide data is mostly static — cache for 1 hour
    setCache(CACHE_KEYS.GUIDE_DATA, response, TTL.ONE_HOUR);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching guide data.' });
  }
};

export { getGuideData };