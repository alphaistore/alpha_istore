const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
require('./config/passport');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);

// ── Security & Middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// CORS
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      ...(process.env.NODE_ENV === 'production' ? [] : ['http://localhost:3000', 'http://localhost:3001']),
      process.env.FRONTEND_URL,
      process.env.CLIENT_URL,
      'https://alpha-istoregh.vercel.app',
    ].filter(Boolean);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many verification attempts. Please try again later.' },
});
app.use('/api/', limiter);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/upload',   require('./routes/upload'));
app.use('/api/contact',  require('./routes/contact'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/metrics',  require('./routes/metrics'));



// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'AlphaiStore API is running 🚀' }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

const User = require('./models/User');
const bcrypt = require('bcryptjs');

// ── Database & Start ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

mongoose
  .connect(mongoUri)
  .then(async () => {
    console.log('✅ MongoDB connected');

    // Auto-sync admin credentials from .env on every deploy/restart
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.SMTP_PASSWORD;
    if (adminEmail && adminPassword) {
      try {
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        const result = await User.findOneAndUpdate(
          { role: 'admin' },
          { email: adminEmail.toLowerCase(), password: hashedPassword },
          { upsert: true, new: true, select: '-password' }
        );
        console.log(`🔑 Admin synced: ${result.email}`);
      } catch (err) {
        console.error('⚠️  Failed to sync admin:', err.message);
      }
    }

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;