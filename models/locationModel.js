import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  locationType: {
    type: String,
    required: true,
    enum: [
        'General Recycling', 
        'E-Waste', 
        'Battery Drop-off',
        'Waste Management',
        'Plastic Recycling',
        'Organic Recycling',
        'Scrap Metal',
        'Environmental Services',
        'Chemical Waste Management',
        'Battery Recycling Plant',
        'Reuse Donation Shelf',
        'Reuse Donation Box',
        'E-Waste Pickup'
    ],
  },
  geometry: {
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
  operatingHours: {
    type: String,
    default: 'N/A',
  },
});

locationSchema.index({ geometry: '2dsphere' });

const Location = mongoose.model('Location', locationSchema);

export default Location;
