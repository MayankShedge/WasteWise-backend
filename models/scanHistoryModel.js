import mongoose from 'mongoose';

const scanHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // This creates a reference to our User model
    },
    item: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    // NEW FIELDS - Enhanced tracking
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    method: {
      type: String,
      enum: [
        'MobileNet Only',
        'CLIP (High Confidence)',
        'Hybrid (Models Agree)',
        'MobileNet (Higher Confidence)',
        'CLIP (Higher Confidence)',
        'Enhanced MobileNet',
        'Enhanced MobileNet v2',
        'Advanced Text Analysis',
        'Hybrid Agreement',
        'Super Enhanced v2',
        'Learning Enhanced',           
        'Legacy'
      ],
      default: 'Legacy'
    },
    detectedItem: {
      type: String,
      default: null
    },
    modelVersion: {
      type: String,
      default: 'v1.0'
    }
  },
  {
    timestamps: true, 
  }
);

// Add indexes for better performance
scanHistorySchema.index({ user: 1, createdAt: -1 });
scanHistorySchema.index({ method: 1, createdAt: -1 });
scanHistorySchema.index({ category: 1, method: 1 });

const ScanHistory = mongoose.model('ScanHistory', scanHistorySchema);

export default ScanHistory;
