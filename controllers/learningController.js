import Learning from '../models/learningModel.js';

// @desc    Get learning for a specific detected item
// @route   GET /api/learning/:detectedItem
// @access  Public (used by scanner)
const getLearningForItem = async (req, res) => {
  try {
    const { detectedItem } = req.params;
    
    const learning = await Learning.findOne({ 
      detectedItem: new RegExp(detectedItem, 'i') // Case insensitive
    }).sort({ 
      strength: -1,  // Get strongest learning first
      frequency: -1 
    });

    if (learning) {
      res.json({
        hasLearning: true,
        correctCategory: learning.correctCategory,
        confidence: learning.confidence,
        frequency: learning.frequency,
        method: 'Learning Enhanced'
      });
    } else {
      res.json({
        hasLearning: false
      });
    }
  } catch (error) {
    console.error('Error fetching learning:', error);
    res.status(500).json({ message: 'Failed to fetch learning data' });
  }
};

// @desc    Create or update learning entry
// @route   POST /api/learning
// @access  Private (called by feedback system)
const createOrUpdateLearning = async (detectedItem, correctCategory, userId) => {
  try {
    // Find existing learning or create new one
    let learning = await Learning.findOne({ detectedItem });

    if (learning) {
      // Update existing learning
      if (learning.correctCategory === correctCategory) {
        // Same correction - increase frequency and confidence
        learning.frequency += 1;
        learning.confidence = Math.min(learning.confidence + 0.1, 1.0);
        learning.successRate = Math.min(learning.successRate + 0.05, 1.0);
      } else {
        // Different correction - create conflict resolution
        if (learning.frequency === 1) {
          // Replace if only one previous entry
          learning.correctCategory = correctCategory;
          learning.contributedBy = [];
        } else {
          // Keep most frequent, but reduce confidence
          learning.confidence = Math.max(learning.confidence - 0.2, 0.3);
        }
      }
      
      // Add contributor
      learning.contributedBy.push({ user: userId });
      learning.lastUpdated = new Date();
      
    } else {
      // Create new learning entry
      learning = new Learning({
        detectedItem,
        correctCategory,
        frequency: 1,
        confidence: 0.8, // Start with good confidence
        contributedBy: [{ user: userId }]
      });
    }

    await learning.save();
    console.log(`✅ Learning updated: ${detectedItem} → ${correctCategory}`);
    return learning;

  } catch (error) {
    console.error('Error updating learning:', error);
    throw error;
  }
};

// @desc    Get all learning data (for admin)
// @route   GET /api/learning/admin/all
// @access  Private (Admin only)
const getAllLearningData = async (req, res) => {
  try {
    const learnings = await Learning.find()
      .populate('contributedBy.user', 'name email')
      .sort({ frequency: -1, confidence: -1 })
      .limit(100);

    const stats = {
      totalLearnings: await Learning.countDocuments(),
      avgConfidence: await Learning.aggregate([
        { $group: { _id: null, avgConf: { $avg: '$confidence' } } }
      ]).then(result => result[0]?.avgConf || 0),
      topCategories: await Learning.aggregate([
        { $group: { _id: '$correctCategory', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    };

    res.json({
      learnings,
      stats
    });
  } catch (error) {
    console.error('Error fetching all learning data:', error);
    res.status(500).json({ message: 'Failed to fetch learning data' });
  }
};

export { 
  getLearningForItem, 
  createOrUpdateLearning, 
  getAllLearningData 
};
