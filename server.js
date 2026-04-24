import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import expressRateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import investmentRoutes from './routes/investments.js';
import propertyRoutes from './routes/properties.js';
import kycRoutes from './routes/kyc.js';
import notificationRoutes from './routes/notifications.js';
import sellRoutes from './routes/sell.js';
import adminRoutes from './routes/admin.js';

// Load environment variables
// Try backend/.env first, then root .env for Vercel
dotenv.config({ path: './backend/.env' });
dotenv.config({ path: './.env' });

// Check if we're in a build environment (Vercel builds)
// During build, VERCEL might not be set, but we're importing this file
// We should not exit during module import - only at runtime
const isBuildTime = !process.env.VERCEL && (process.env.VERCEL_ENV || process.env.CI || process.env.NOW_BUILD);

// Check if required environment variables are set
// Don't exit during build time - only validate at runtime
if (!process.env.MONGODB_URI) {
  if (isBuildTime || process.env.VERCEL === '1') {
    // During build or Vercel serverless, just warn - don't exit
    console.warn('⚠️  MONGODB_URI is not set! Make sure to add it in Vercel Environment Variables.');
    console.warn('📝 Required: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/proptoken');
  } else {
    // Local development - exit if missing
    console.error('❌ MONGODB_URI is not set!');
    console.error('📝 Please create a .env file in the backend folder with:');
    console.error('   MONGODB_URI=mongodb://localhost:27017/proptoken');
    console.error('');
    console.error('💡 If using MongoDB Atlas, use:');
    console.error('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/proptoken');
    process.exit(1);
  }
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'default_jwt_secret_change_in_production') {
  if (isBuildTime || (process.env.VERCEL === '1' && process.env.NODE_ENV === 'production')) {
    // During build or production Vercel - warn but don't exit (will fail at runtime)
    console.warn('⚠️  JWT_SECRET is not set or using default value!');
    console.warn('📝 Make sure to set JWT_SECRET in Vercel Environment Variables');
    console.warn('💡 Generate a secure secret: openssl rand -base64 32');
  } else if (process.env.NODE_ENV === 'production') {
    console.error('❌ JWT_SECRET is not set or using default value!');
    console.error('📝 Please set a strong JWT_SECRET in your .env file');
    console.error('💡 Generate a secure secret: openssl rand -base64 32');
    process.exit(1);
  } else {
    console.warn('⚠️  Using default JWT_SECRET (NOT SECURE FOR PRODUCTION)');
    process.env.JWT_SECRET = 'default_jwt_secret_change_in_production';
  }
}

// Connect to database only if not in build time
// Database connection will happen at runtime when API is called
if (!isBuildTime && process.env.VERCEL !== '1') {
  connectDB();
}

const app = express();

// Security Middleware
// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS Configuration - Restrict to frontend domain in production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // In development, allow common localhost ports
    if (process.env.NODE_ENV !== 'production') {
      const devOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:8080'];
      if (devOrigins.includes(origin)) {
        return callback(null, true);
      }
    }

    // In production, check ALLOWED_ORIGINS environment variable
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.ALLOWED_ORIGINS) {
        console.error('❌ ALLOWED_ORIGINS not set in production!');
        console.error('📝 Set ALLOWED_ORIGINS in Vercel environment variables');
        console.error('💡 Example: https://yourapp.vercel.app');
        return callback(new Error('CORS configuration error'));
      }

      const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn(`⚠️  CORS blocked origin: ${origin}`);
        console.warn(`📝 Allowed origins: ${allowedOrigins.join(', ')}`);
        return callback(new Error('Not allowed by CORS'));
      }
    }

    // Fallback
    callback(new Error('CORS policy violation'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Rate Limiting
const limiter = expressRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for auth routes
const authLimiter = expressRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Body parsing middleware with size limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'PropToken API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sell', sellRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation'
    });
  }
  
  // Handle "entity too large" errors
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'File size too large. Please compress your images or use smaller files. Maximum size is 50MB.'
    });
  }
  
  // Don't expose error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Export app for Vercel serverless functions
export default app;

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
  });

  // Handle port already in use error
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use!`);
      console.error(`💡 Try one of these solutions:`);
      console.error(`   1. Kill the process: Get-NetTCPConnection -LocalPort ${PORT} | Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess`);
      console.error(`   2. Change PORT in .env file to a different port (e.g., 5001)`);
      process.exit(1);
    } else {
      throw error;
    }
  });
}
