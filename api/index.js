// api/index.js - Main API handler for Vercel
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Import all route files
import authRoutes from '../routes/auth.js';
import userRoutes from '../routes/users.js';
import propertyRoutes from '../routes/properties.js';
import investmentRoutes from '../routes/investments.js';
import kycRoutes from '../routes/kyc.js';
import adminRoutes from '../routes/admin.js';
import sellRoutes from '../routes/sell.js';
import notificationRoutes from '../routes/notifications.js';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection state
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Mount all routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sell', sellRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'PropToken API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Vercel serverless function handler
export default async function handler(req, res) {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Handle the request with Express
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database connection error',
      error: error.message
    });
  }
}
