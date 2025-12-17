import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { locations } from './data/locations.js';
import { guideData } from './data/guideData.js'; // 1. Import guideData
import Location from './models/locationModel.js';
import Schedule from './models/ScheduleModel.js'; // 2. Import Schedule model

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const importData = async () => {
  await connectDB();
  try {
    // Clear existing data
    await Location.deleteMany();
    await Schedule.deleteMany();

    // Insert new data
    await Location.insertMany(locations);
    await Schedule.insertMany(guideData.schedules); // 3. Seed schedules

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

// ... (destroyData function can be updated similarly if needed)
const destroyData = async () => {
  await connectDB();
  try {
    await Location.deleteMany();
    await Schedule.deleteMany(); // Also destroy schedules
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};


if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
