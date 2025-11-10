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

// Routes
app.use('/api/auth', require('../backend/src/routes/auth'));
app.use('/api/users', require('../backend/src/routes/users'));
app.use('/api/posts', require('../backend/src/routes/posts'));
app.use('/api/upload', require('../backend/src/routes/upload'));
app.use('/api/admin', require('../backend/src/routes/admin'));

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Errors
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message });
});

module.exports = app;
