// Vercel Serverless Function
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const admin = require('firebase-admin');

// Initialize Firebase
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
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
app.get('/', (req, res) => res.json({ message: 'API is working!' }));
app.get('/test', (req, res) => res.json({ message: 'Test endpoint working!' }));

// Routes - using local copies in api directory
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/posts', require('./routes/posts'));
app.use('/upload', require('./routes/upload'));
app.use('/admin', require('./routes/admin'));

// Health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Errors
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ message: err.message });
});

// Export handler for Vercel serverless
module.exports = app;
