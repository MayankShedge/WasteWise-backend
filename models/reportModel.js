import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    // --- THIS IS THE NEWLY ADDED FIELD ---
    // This creates a direct reference to a document in our 'User' collection
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    status: {
      type: String,
      enum: ['new', 'viewed', 'resolved'],
      default: 'new',
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);

export default Report;
