const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Get Firestore instance
const db = admin.firestore();

/**
 * POST /api/auth/register
 * Complete user registration after Google Sign-In (no passcode required)
 */
router.post('/register', async (req, res) => {
  try {
    const { idToken, displayName } = req.body;

    console.log('📝 Registration request received:', { 
      hasToken: !!idToken, 
      hasDisplayName: !!displayName
    });

    if (!idToken) {
      return res.status(400).json({ message: 'ID token is required' });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Check if user already registered
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      console.log('✅ User already registered');
      return res.json({ 
        message: 'User already registered', 
        user: userDoc.data() 
      });
    }

    // Determine if user should be admin
    const isAdmin = decodedToken.email === process.env.ADMIN_EMAIL;

    // Use provided displayName or fallback to Google name or email
    const finalDisplayName = displayName || decodedToken.name || decodedToken.email.split('@')[0];

    // Create user profile in Firestore
    const userData = {
      uid: uid,
      email: decodedToken.email,
      displayName: finalDisplayName,
      photoURL: decodedToken.picture || null,
      role: isAdmin ? 'admin' : 'user',
      disabled: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActivity: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(uid).set(userData);

    console.log('✅ User registered successfully:', uid);

    res.status(201).json({ 
      message: 'Registration successful', 
      user: userData 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

/**
 * POST /api/auth/verify-token
 * Verify Firebase ID token and return user data
 */
router.post('/verify-token', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'ID token is required' });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ 
        message: 'User not registered',
        registered: false
      });
    }

    const userData = userDoc.data();

    if (userData.disabled) {
      return res.status(403).json({ message: 'Account has been disabled' });
    }

    res.json({ 
      valid: true, 
      registered: true,
      user: userData 
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

module.exports = router;
