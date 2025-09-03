import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage for our reports
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'WasteWise_Reports', // A folder name in your Cloudinary account
    allowed_formats: ['jpeg', 'png', 'jpg'],
  },
});

export { cloudinary, storage };
