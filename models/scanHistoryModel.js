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
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

const ScanHistory = mongoose.model('ScanHistory', scanHistorySchema);

export default ScanHistory;
