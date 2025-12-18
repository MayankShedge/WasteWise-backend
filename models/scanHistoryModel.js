import mongoose from 'mongoose';

const scanHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', 
    },
    item: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    method: {
      type: String,
      enum: [
        'Enhanced MobileNet v2',
        'Advanced Text Analysis',
        'Hybrid Agreement',
        'Learning Enhanced',
        'Improved Classification',
        'Fallback - Vehicle Detection',
        'Fallback - Recyclable Detection',
        'Fallback - Safe Default',
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

scanHistorySchema.index({ user: 1, createdAt: -1 });
scanHistorySchema.index({ method: 1, createdAt: -1 });
scanHistorySchema.index({ category: 1, method: 1 });

const ScanHistory = mongoose.model('ScanHistory', scanHistorySchema);

export default ScanHistory;