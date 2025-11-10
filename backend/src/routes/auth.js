const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const admin = require('firebase-admin');

// Get Firestore instance
const db = admin.firestore();

/**
 * POST /api/auth/verify-passcode
 * Verify if passcode is valid
 */
router.post('/verify-passcode', async (req, res) => {
  try {
    const { passcode } = req.body;

    if (!passcode) {
      return res.status(400).json({ message: 'Passcode is required' });
    }

    // Check against environment passcode
    const validPasscode = process.env.REGISTRATION_PASSCODE;
    
    if (passcode === validPasscode) {
      return res.json({ valid: true });
    }

    return res.status(401).json({ valid: false, message: 'Invalid passcode' });
  } catch (error) {
    console.error('Passcode verification error:', error);
    res.status(500).json({ message: 'Server error during passcode verification' });
  }
});

/**
 * POST /api/auth/register
 * Complete user registration after Google Sign-In
 */
router.post('/register', async (req, res) => {
  try {
    const { idToken, passcode } = req.body;

    if (!idToken || !passcode) {
      return res.status(400).json({ message: 'ID token and passcode are required' });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Verify passcode
    const validPasscode = process.env.REGISTRATION_PASSCODE;
    if (passcode !== validPasscode) {
      return res.status(401).json({ message: 'Invalid passcode' });
    }

    // Check if user already registered
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      return res.json({ 
        message: 'User already registered', 
        user: userDoc.data() 
      });
    }

    // Determine if user should be admin
    const isAdmin = decodedToken.email === process.env.ADMIN_EMAIL;

    // Create user profile in Firestore
    const userData = {
      uid: uid,
      email: decodedToken.email,
      displayName: decodedToken.name || decodedToken.email.split('@')[0],
      photoURL: decodedToken.picture || null,
      role: isAdmin ? 'admin' : 'user',
      disabled: false,
      passcodeUsed: await bcrypt.hash(passcode, 10),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActivity: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(uid).set(userData);

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
