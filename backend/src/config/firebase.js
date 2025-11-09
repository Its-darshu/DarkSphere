const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
let serviceAccount;

try {
  // Check if service account is provided as environment variable (for Railway, Vercel, etc.)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log('📦 Loading Firebase service account from environment variable...');
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Load from file (for local development)
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../../firebase-service-account.json');
    console.log('📦 Loading Firebase service account from file...');
    const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(serviceAccountContent);
  }
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.appspot.com`
  });

  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
  console.error('💡 Make sure FIREBASE_SERVICE_ACCOUNT env var is set or firebase-service-account.json exists');
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage().bucket();

module.exports = { admin, db, auth, storage };
