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
import Item from './models/Item.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    'https://lostnfoundsjce.netlify.app',
    'http://localhost:5173'
  ],
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));


// --- MULTER SETUP ---
// Memory storage is mandatory for Netlify as the filesystem is read-only
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- DATABASE CONNECTION ---
const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI)

.then(() => console.log('Connected to MongoDB Atlas'))
.catch((err) => console.error('Error connecting to MongoDB:', err));

const router = express.Router();

// --- ROUTES ---

router.get('/', (req, res) => {
  res.send('Welcome to Lost & Found API');
});

// Items Routes
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
    const {
      title,
      description,
      category,
      status,
      contactInfo,
      reportedBy,
      date,
      'location[lat]': lat,
      'location[lng]': lng,
      'location[description]': locationDescription,
      isResolved,
    } = req.body;

    const newItem = new Item({
      title,
      description,
      category,
      status,
      contactInfo,
      reportedBy: reportedBy || 'Anonymous User',
      isResolved: isResolved === 'true',
      date: date ? new Date(date) : new Date(),
      location: {
        lat: lat ? parseFloat(lat) : undefined,
        lng: lng ? parseFloat(lng) : undefined,
        description: locationDescription || '',
      },
      // Note: imageUrl will be empty because local storage is not supported on Netlify.
      // To save images, you must integrate Cloudinary here.
      imageUrl: '', 
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error('❌ Error saving item:', err);
    res.status(400).json({ message: 'Failed to save item', error: err.message });
  }
});

// Registration and OTP routes
router.post('/register/college', registerCollegeUser);
router.post('/register/guest/send-otp', sendGuestOtp);
router.post('/register/guest/verify-otp', verifyGuestOtp);

// Identity verification routes
router.post('/verify/college', async (req, res) => {
  const { srNo, password } = req.body;
  try {
    const user = await CollegeUser.findOne({ srNo });
    if (!user) {
      return res.status(404).json({ success: false, message: 'College user not found' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    res.json({ success: true, message: 'College user verified' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Verification error', error: err });
  }
});

router.post('/verify/guest', async (req, res) => {
  const { mobile } = req.body;
  try {
    const guest = await GuestUser.findOne({ mobile });
    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest user not found' });
    }
    res.json({ success: true, message: 'Guest user verified' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Verification error', error: err });
  }
});

// Admin endpoints
router.get('/admin/users/college', async (req, res) => {
  try {
    const users = await CollegeUser.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch college users', error: err });
  }
});

router.get('/admin/users/guest', async (req, res) => {
  try {
    const guests = await GuestUser.find();
    res.json(guests);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch guest users', error: err });
  }
});

router.get('/admin/items/lost', async (req, res) => {
  try {
    const lostItems = await Item.find({ status: 'lost' }).sort({ date: -1 });
    res.json(lostItems);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch lost items', error: err });
  }
});

router.get('/admin/items/found', async (req, res) => {
  try {
    const foundItems = await Item.find({ status: 'found' }).sort({ date: -1 });
    res.json(foundItems);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch found items', error: err });
  }
});

// Apply the router to the /api path
app.use('/api', router);

// --- STARTUP LOGIC ---

// Only listen locally if not in production (Netlify environment)

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Local Server running at http://localhost:${PORT}`);
  });


// Export for Netlify Functions
export const handler = serverless(app);