import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    originalResult: {
      category: {
        type: String,
        required: true,
        enum: ['Wet Waste', 'Dry Waste', 'E-waste', 'Hazardous Waste', 'Biomedical Waste']
      },
      confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      method: {
        type: String,
        required: true,
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
        required: false,
        default: 'Unknown'
      }
    },
    userSaysCorrect: {
      type: Boolean,
      required: true
    },
    userCorrection: {
      type: String,
      enum: ['Wet Waste', 'Dry Waste', 'E-waste', 'Hazardous Waste', 'Biomedical Waste'],
      required: function() {
        return !this.userSaysCorrect;
      }
    },
    imageMetadata: {
      size: { type: Number, default: null },
      type: { type: String, default: null },
      dimensions: {
        width: { type: Number, default: null },
        height: { type: Number, default: null }
      }
    },
    processed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

feedbackSchema.index({ user: 1, createdAt: -1 });
feedbackSchema.index({ 'originalResult.category': 1, userSaysCorrect: 1 });
feedbackSchema.index({ processed: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;