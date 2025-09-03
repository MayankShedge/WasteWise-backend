import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Route imports
import reportRoutes from './routes/reportRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import guideRoutes from './routes/guideRoutes.js';
import userRoutes from './routes/userRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import scheduleRoutes from './routes/ScheduleRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import articleRoutes from './routes/ArticleRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/reports', reportRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/guide', guideRoutes);
app.use('/api/users', userRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/articles', articleRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  });

