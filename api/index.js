// Vercel Serverless Function - Express Backend Wrapperconst express = require('express');

const express = require('express');const cors = require('cors');

const cors = require('cors');const helmet = require('helmet');

const helmet = require('helmet');

const admin = require('firebase-admin');// Initialize Firebase (must be first)

require('../backend/src/config/firebase');

// Initialize Firebase Admin

if (!admin.apps.length) {// Import routes

  try {const authRoutes = require('../backend/src/routes/auth');

    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);const userRoutes = require('../backend/src/routes/users');

    admin.initializeApp({const postRoutes = require('../backend/src/routes/posts');

      credential: admin.credential.cert(serviceAccount),const uploadRoutes = require('../backend/src/routes/upload');

      storageBucket: 'darksphere-369.firebasestorage.app'const adminRoutes = require('../backend/src/routes/admin');

    });

    console.log('✅ Firebase Admin initialized');const app = express();

  } catch (error) {

    console.error('❌ Firebase Admin initialization failed:', error.message);// Security middleware

  }app.use(helmet());

}

// CORS configuration

// Create Express appconst corsOptions = {

const app = express();  origin: process.env.CORS_ORIGIN || '*',

  credentials: true,

// Middleware  optionsSuccessStatus: 200

app.use(helmet({};

  crossOriginResourcePolicy: { policy: "cross-origin" },app.use(cors(corsOptions));

  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }

}));// Body parser

app.use(express.json());

app.use(cors({app.use(express.urlencoded({ extended: true }));

  origin: process.env.NODE_ENV === 'production' 

    ? ['https://dark-sphere.vercel.app', 'https://darksphere-369.firebaseapp.com']// Health check endpoint

    : 'http://localhost:5173',app.get('/api/health', (req, res) => {

  credentials: true  res.json({ 

}));    status: 'ok', 

    timestamp: new Date().toISOString(),

app.use(express.json());    environment: process.env.NODE_ENV || 'production'

app.use(express.urlencoded({ extended: true }));  });

});

// Import routes

const authRoutes = require('../backend/src/routes/auth');// API routes

const userRoutes = require('../backend/src/routes/users');app.use('/api/auth', authRoutes);

const postRoutes = require('../backend/src/routes/posts');app.use('/api/users', userRoutes);

const uploadRoutes = require('../backend/src/routes/upload');app.use('/api/posts', postRoutes);

const adminRoutes = require('../backend/src/routes/admin');app.use('/api/upload', uploadRoutes);

app.use('/api/admin', adminRoutes);

// Mount routes

app.use('/api/auth', authRoutes);// 404 handler

app.use('/api/users', userRoutes);app.use((req, res) => {

app.use('/api/posts', postRoutes);  res.status(404).json({ message: 'Route not found' });

app.use('/api/upload', uploadRoutes);});

app.use('/api/admin', adminRoutes);

// Global error handler

// Health checkapp.use((err, req, res, next) => {

app.get('/api/health', (req, res) => {  console.error('Global error handler:', err);

  res.json({   

    status: 'ok',   // Multer errors

    timestamp: new Date().toISOString(),  if (err.code === 'LIMIT_FILE_SIZE') {

    firebase: admin.apps.length > 0 ? 'connected' : 'disconnected'    return res.status(413).json({ 

  });      message: `File too large. Maximum size is ${process.env.MAX_IMAGE_SIZE_MB || 5}MB` 

});    });

  }

// Error handling  

app.use((err, req, res, next) => {  if (err.message && err.message.includes('Invalid file type')) {

  console.error('Error:', err);    return res.status(400).json({ message: err.message });

  res.status(err.status || 500).json({  }

    error: err.message || 'Internal server error',

    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })  res.status(err.status || 500).json({ 

  });    message: err.message || 'Internal server error',

});    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })

  });

// 404 handler});

app.use((req, res) => {

  res.status(404).json({ error: 'Route not found' });module.exports = app;

});

// Export for Vercel
module.exports = app;
