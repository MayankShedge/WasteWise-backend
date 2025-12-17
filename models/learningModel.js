import mongoose from 'mongoose';

const learningSchema = new mongoose.Schema({
  detectedItem: { 
    type: String, 
    required: true,
    index: true  // Fast lookups
  },
  correctCategory: { 
    type: String, 
    required: true,
    enum: ['Wet Waste', 'Dry Waste', 'E-waste', 'Hazardous Waste', 'Biomedical Waste']
  },
  frequency: { 
    type: Number, 
    default: 1 
  },
  confidence: { 
    type: Number, 
    default: 1.0,
    min: 0.1,
    max: 1.0
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  },
  contributedBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  successRate: {
    type: Number,
    default: 1.0  
  }
}, {
  timestamps: true
});

// Compound index for fast lookups
learningSchema.index({ detectedItem: 1, correctCategory: 1 });

// Virtual for learning strength (frequency + success rate)
learningSchema.virtual('strength').get(function() {
  return this.frequency * this.successRate * this.confidence;
});

const Learning = mongoose.model('Learning', learningSchema);

export default Learning;
