require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const { createAdminUser } = require('./utils/initAdmin');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const eventRoutes = require('./routes/event.routes');
const venueRoutes = require('./routes/venue.routes');
const registrationRoutes = require('./routes/registration.routes');
const scheduleRoutes = require('./routes/schedule.routes');
const certificateRoutes = require('./routes/certificate.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const eventMemoryRoutes = require('./routes/eventMemory.routes');
const registrationFormRoutes = require('./routes/registrationForm.routes');
const notificationRoutes = require('./routes/notification.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();

// Middleware
// Enhanced CORS: allow multiple origins and common local dev hosts
const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  // Common case where frontend is served on local network IPs
  'http://172.22.15.28:8080',
];

// Support comma-separated list in CORS_ORIGINS, or single CORS_ORIGIN
const envOrigins = []
  .concat(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [])
  .concat(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : [])
  .map((o) => o && o.trim())
  .filter(Boolean);

const allowlist = envOrigins.length > 0 ? envOrigins : DEFAULT_ORIGINS;

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser or same-origin requests where origin may be undefined
    if (!origin) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[CORS] No origin header (non-browser or same-origin) -> allowed');
      }
      return callback(null, true);
    }
    if (allowlist.includes(origin)) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[CORS] Allowed by allowlist: ${origin}`);
      }
      return callback(null, true);
    }
    // Allow common localhost/LAN origins in development unless explicitly disabled
    const allowLan = process.env.CORS_ALLOW_LAN !== 'false';
    if (allowLan) {
      const lanRegex = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.[0-9]{1,3}\.[0-9]{1,3}|172\.(1[6-9]|2[0-9]|3[0-1])\.[0-9]{1,3}\.[0-9]{1,3})(:[0-9]+)?$/;
      if (lanRegex.test(origin)) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[CORS] Allowed by LAN regex (dev): ${origin}`);
        }
        return callback(null, true);
      }
    }
    // In development, optionally allow all if explicitly requested via env
    if (process.env.CORS_ALLOW_ALL === 'true') {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[CORS] Allowed by CORS_ALLOW_ALL=true: ${origin}`);
      }
      return callback(null, true);
    }
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[CORS] Blocked: ${origin} not in allowlist: ${JSON.stringify(allowlist)}`);
    }
    return callback(new Error(`CORS blocked: ${origin} not in allowlist`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Serve static files (certificates)
const path = require('path');
app.use('/certificates', express.static(path.join(__dirname, '../certificates')));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    // Create admin user if not exists
    return createAdminUser();
  })
  .then(() => {
    console.log('Admin user check completed');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Event Management API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/event-memories', eventMemoryRoutes);
app.use('/api/registration-forms', registrationFormRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

