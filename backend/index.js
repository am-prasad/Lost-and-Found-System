import serverless from 'serverless-http';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';

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

// --- CHANGE 1: MULTER STORAGE ---
// Netlify filesystem is read-only. We must store files in /tmp/ (temporary) 
// or use MemoryStorage. Note: Images will disappear after the function finishes 
// unless you use Cloudinary or S3.
const storage = multer.memoryStorage(); 
const upload = multer({ storage });

// --- CHANGE 2: DATABASE CONNECTION ---
// Use process.env.MONGODB_URI instead of a hardcoded localhost string.
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lostandfound';

mongoose
  .connect(mongoURI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err));

// Item schema (Keep as is)
const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['electronics', 'clothing', 'accessories', 'documents', 'keys', 'other'],
    required: true,
  },
  status: { type: String, enum: ['lost', 'found'], required: true },
  location: {
    lat: Number,
    lng: Number,
    description: String,
  },
  date: { type: Date, default: Date.now },
  reportedBy: { type: String, default: 'Anonymous User' },
  contactInfo: { type: String, required: true },
  imageUrl: String,
  isResolved: { type: Boolean, default: false },
});

const Item = mongoose.model('Item', itemSchema);

// --- CHANGE 3: ROUTE WRAPPING ---
// Netlify routes functions to /.netlify/functions/index. 
// Using a Router ensures paths match correctly.
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Welcome to Lost & Found API');
});

router.get('/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ date: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching items', error: err });
  }
});

router.post('/items', upload.single('image'), async (req, res) => {
  try {
    // Note: Since we use memoryStorage, req.file.buffer contains the image data.
    // For now, we leave imageUrl empty because you can't host files on Netlify.
    // Recommended: Use Cloudinary here.
    const { title, description, category, status, contactInfo, reportedBy, date, 
            'location[lat]': lat, 'location[lng]': lng, 'location[description]': locationDescription, isResolved } = req.body;

    const newItem = new Item({
      title, description, category, status, contactInfo,
      reportedBy: reportedBy || 'Anonymous User',
      isResolved: isResolved === 'true',
      date: date ? new Date(date) : new Date(),
      location: {
        lat: lat ? parseFloat(lat) : undefined,
        lng: lng ? parseFloat(lng) : undefined,
        description: locationDescription || '',
      },
      imageUrl: "", // Function filesystems are temporary!
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: 'Failed to save item', error: err.message });
  }
});

// Add all other routes to the router
router.post('/register/college', registerCollegeUser);
router.post('/register/guest/send-otp', sendGuestOtp);
router.post('/register/guest/verify-otp', verifyGuestOtp);
// ... Add all your other app.post/get here but change 'app' to 'router'

// Use the router with the /api prefix
app.use('/api', router);

// --- CHANGE 4: CONDITIONAL LISTEN ---
// Only listen on a port if NOT running on Netlify
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Local Server: http://localhost:${PORT}`));
}

export const handler = serverless(app);