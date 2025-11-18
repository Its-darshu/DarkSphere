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

// Log all requests - this helps debug what path Vercel is passing
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`, 'Path:', req.path, 'Original URL:', req.originalUrl, 'Base URL:', req.baseUrl);
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
// Mount routes at both paths to handle different Vercel routing behaviors
try {
  console.log('📂 Loading routes...');
  const authRoutes = require('./routes/auth');
  const usersRoutes = require('./routes/users');
  const postsRoutes = require('./routes/posts');
  const uploadRoutes = require('./routes/upload');
  const adminRoutes = require('./routes/admin');
  
  // Mount at /api prefix (in case Vercel passes full path)
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/posts', postsRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/admin', adminRoutes);
  
  // Also mount without /api prefix (in case Vercel strips it)
  app.use('/auth', authRoutes);
  app.use('/users', usersRoutes);
  app.use('/posts', postsRoutes);
  app.use('/upload', uploadRoutes);
  app.use('/admin', adminRoutes);
  
  console.log('✅ All routes loaded (mounted at both /api/* and /*)');
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
// Vercel expects the default export to be the Express app
module.exports = app;
