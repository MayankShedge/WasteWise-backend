import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  area: {
    type: String,
    required: true,
  },
  collection: {
    type: String,
    required: true,
  },
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;
