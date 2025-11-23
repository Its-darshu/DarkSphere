const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { verifyToken } = require('../middleware/auth');
const { validateProfile } = require('../utils/validation');

// Get Firestore instance
const db = admin.firestore();

/**
 * GET /api/users/me
 * Get current user profile
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update last activity
    await db.collection('users').doc(req.user.uid).update({
      lastActivity: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json(userDoc.data());
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PUT /api/users/me
 * Update current user profile
 */
router.put('/me', verifyToken, async (req, res) => {
  try {
    const { displayName, photoURL } = req.body;

    const validation = validateProfile(displayName, req.user.email);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const updates = {};
    if (displayName) updates.displayName = displayName.trim();
    if (photoURL !== undefined) updates.photoURL = photoURL;

    await db.collection('users').doc(req.user.uid).update(updates);

    const updatedDoc = await db.collection('users').doc(req.user.uid).get();
    res.json(updatedDoc.data());
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/users/:uid
 * Get public user profile
 */
router.get('/:uid', verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userDoc.data();
    
    // Return only public fields
    res.json({
      uid: userData.uid,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      role: userData.role
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
