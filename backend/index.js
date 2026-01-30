import serverless from 'serverless-http';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import multer from 'multer';

import {
  registerCollegeUser,
  sendGuestOtp,
  verifyGuestOtp,
} from './controllers/registerController.js';

import CollegeUser from './models/CollegeUser.js';
import GuestUser from './models/GuestUser.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Memory storage is required for Serverless (disk is read-only)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Use environment variable for MongoDB
const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err));

const router = express.Router();

// Move all your routes into this router
router.get('/', (req, res) => res.send('Welcome to Lost & Found API'));

router.get('/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ date: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching items' });
  }
});

// ... Add all your other routes here using router.post/get ...
router.post('/register/college', registerCollegeUser);
router.post('/register/guest/send-otp', sendGuestOtp);
router.post('/register/guest/verify-otp', verifyGuestOtp);

// Apply the router to the /api path
app.use('/api', router);

// Export for Netlify
export const handler = serverless(app);

// Keep local listen for development only
if (process.env.NODE_ENV !== 'production') {
  app.listen(5000, () => console.log('Local server on 5000'));
}