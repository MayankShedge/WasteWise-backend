import Feedback from '../models/feedbackModel.js';
import { createOrUpdateLearning } from './learningController.js';

// @desc    Submit user feedback
// @route   POST /api/feedback
// @access  Private
const submitFeedback = async (req, res) => {
  const { originalResult, userSaysCorrect, userCorrection, imageMetadata } = req.body;

  // Validation
  if (!originalResult || typeof userSaysCorrect !== 'boolean') {
    return res.status(400).json({ message: 'Original result and user feedback are required' });
  }

  // If user says it's incorrect, correction is required
  if (!userSaysCorrect && !userCorrection) {
    return res.status(400).json({ message: 'User correction is required when marking as incorrect' });
  }

  try {
    const feedback = new Feedback({
      user: req.user._id,
      originalResult: {
        category: originalResult.category,
        confidence: parseFloat(originalResult.confidence) || 0,
        method: originalResult.method || 'Legacy'
      },
      userSaysCorrect,
      userCorrection: userSaysCorrect ? null : userCorrection,
      // ✅ FIXED: Properly structure imageMetadata
      imageMetadata: {
        size: imageMetadata?.size || null,
        type: imageMetadata?.type || null,
        dimensions: {
          width: imageMetadata?.dimensions?.width || null,
          height: imageMetadata?.dimensions?.height || null
        }
      },
      timestamp: new Date()
    });

    const savedFeedback = await feedback.save();

    // 🧠 NEW: Auto-learn from incorrect feedback
    if (!userSaysCorrect && originalResult.detectedItem) {
      try {
        console.log(`🧠 Learning from feedback: ${originalResult.detectedItem} → ${userCorrection}`);
        await createOrUpdateLearning(
          originalResult.detectedItem.toLowerCase(), 
          userCorrection, 
          req.user._id
        );
        console.log('✅ Learning updated successfully');
      } catch (learningError) {
        console.error('❌ Learning update failed:', learningError);
        // Don't fail the feedback submission if learning fails
      }
    }

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: {
        id: savedFeedback._id,
        category: savedFeedback.originalResult.category,
        userSaysCorrect: savedFeedback.userSaysCorrect,
        userCorrection: savedFeedback.userCorrection,
        timestamp: savedFeedback.timestamp
      }
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(400).json({ message: 'Failed to submit feedback: ' + error.message });
  }
};

// @desc    Get user's feedback history
// @route   GET /api/feedback/my-feedback
// @access  Private
const getUserFeedback = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const feedbacks = await Feedback.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('-user -__v');

    const total = await Feedback.countDocuments({ user: req.user._id });

    res.json({
      feedbacks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching feedback history:', error);
    res.status(500).json({ message: 'Failed to fetch feedback history' });
  }
};

// @desc    Get feedback analytics (for admin/development)
// @route   GET /api/feedback/analytics
// @access  Private
const getFeedbackAnalytics = async (req, res) => {
  try {
    // Overall accuracy by category
    const accuracyByCategory = await Feedback.aggregate([
      {
        $group: {
          _id: '$originalResult.category',
          totalFeedback: { $sum: 1 },
          correctPredictions: { 
            $sum: { $cond: ['$userSaysCorrect', 1, 0] } 
          },
          incorrectPredictions: { 
            $sum: { $cond: ['$userSaysCorrect', 0, 1] } 
          }
        }
      },
      {
        $addFields: {
          accuracy: {
            $multiply: [
              { $divide: ['$correctPredictions', '$totalFeedback'] },
              100
            ]
          }
        }
      },
      {
        $sort: { accuracy: -1 }
      }
    ]);

    // Method performance
    const methodPerformance = await Feedback.aggregate([
      {
        $group: {
          _id: '$originalResult.method',
          totalFeedback: { $sum: 1 },
          correctPredictions: { 
            $sum: { $cond: ['$userSaysCorrect', 1, 0] } 
          },
          avgConfidence: { $avg: '$originalResult.confidence' }
        }
      },
      {
        $addFields: {
          accuracy: {
            $multiply: [
              { $divide: ['$correctPredictions', '$totalFeedback'] },
              100
            ]
          }
        }
      },
      {
        $sort: { accuracy: -1 }
      }
    ]);

    // Common misclassifications
    const misclassifications = await Feedback.aggregate([
      { $match: { userSaysCorrect: false } },
      {
        $group: {
          _id: {
            predicted: '$originalResult.category',
            actual: '$userCorrection'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Summary statistics
    const totalFeedback = await Feedback.countDocuments();
    const correctPredictions = await Feedback.countDocuments({ userSaysCorrect: true });
    const incorrectPredictions = await Feedback.countDocuments({ userSaysCorrect: false });

    res.json({
      accuracyByCategory,
      methodPerformance,
      misclassifications,
      summary: {
        totalFeedback,
        correctPredictions,
        incorrectPredictions,
        overallAccuracy: totalFeedback > 0 ? (correctPredictions / totalFeedback * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching feedback analytics:', error);
    res.status(500).json({ message: 'Failed to fetch feedback analytics' });
  }
};

export { submitFeedback, getUserFeedback, getFeedbackAnalytics };
