// Vercel Serverless Function
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const admin = require('firebase-admin');

console.log('🚀 Starting API initialization...');

// Initialize Firebase
if (!admin.apps.length) {
  try {
    console.log('📦 Initializing Firebase Admin...');
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
  }
}

const app = express();

// Middleware
app.use(helmet({ crossOriginEmbedderPolicy: false, crossOriginOpenerPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Test route
app.get('/', (req, res) => {
  console.log('Root route hit');
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

app.get('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Test endpoint working!', env: process.env.NODE_ENV });
});

// Health
app.get('/health', (req, res) => {
  console.log('Health check');
  res.json({ 
    status: 'ok',
    firebase: !!admin.apps.length,
    timestamp: new Date().toISOString()
  });
});

// Try to load routes with error handling
try {
  console.log('📂 Loading routes...');
  app.use('/auth', require('./routes/auth'));
  console.log('✅ Auth routes loaded');
  app.use('/users', require('./routes/users'));
  console.log('✅ Users routes loaded');
  app.use('/posts', require('./routes/posts'));
  console.log('✅ Posts routes loaded');
  app.use('/upload', require('./routes/upload'));
  console.log('✅ Upload routes loaded');
  app.use('/admin', require('./routes/admin'));
  console.log('✅ Admin routes loaded');
} catch (error) {
  console.error('❌ Error loading routes:', error);
}

// 404 handler
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({ 
    error: 'Not Found',
    method: req.method,
    url: req.url,
    message: 'The requested endpoint does not exist'
  });
});

// Errors
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ message: err.message, error: err.toString() });
});

console.log('✅ API setup complete');

// Export handler for Vercel serverless
module.exports = app;
