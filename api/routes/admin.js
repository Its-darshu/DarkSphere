const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { verifyToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

// Get Firestore instance
const db = admin.firestore();

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(requireAdmin);

/**
 * GET /api/admin/users
 * Get all users (with pagination)
 */
router.get('/users', async (req, res) => {
  try {
    const { limit = 50, startAfter } = req.query;

    let query = db.collection('users')
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit));

    if (startAfter) {
      const startDoc = await db.collection('users').doc(startAfter).get();
      if (startDoc.exists) {
        query = query.startAfter(startDoc);
      }
    }

    const snapshot = await query.get();
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      users,
      hasMore: snapshot.docs.length === parseInt(limit),
      lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/admin/users/:uid/disable
 * Disable or enable a user account
 */
router.post('/users/:uid/disable', async (req, res) => {
  try {
    const { disabled } = req.body;

    if (typeof disabled !== 'boolean') {
      return res.status(400).json({ message: 'Disabled status must be boolean' });
    }

    // Prevent disabling own account
    if (req.params.uid === req.user.uid) {
      return res.status(400).json({ message: 'Cannot disable your own account' });
    }

    // Update user status
    await db.collection('users').doc(req.params.uid).update({
      disabled: disabled
    });

    // Also disable in Firebase Auth
    await admin.auth().updateUser(req.params.uid, {
      disabled: disabled
    });

    // Log action
    await db.collection('audit_logs').add({
      adminUid: req.user.uid,
      action: disabled ? 'user_disabled' : 'user_enabled',
      targetType: 'user',
      targetId: req.params.uid,
      details: { disabled },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ 
      message: disabled ? 'User disabled successfully' : 'User enabled successfully' 
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /api/admin/users/:uid
 * Delete a user account and all their posts
 */
router.delete('/users/:uid', async (req, res) => {
  try {
    // Prevent deleting own account
    if (req.params.uid === req.user.uid) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const userDoc = await db.collection('users').doc(req.params.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all user's posts
    const posts = await db.collection('posts')
      .where('userId', '==', req.params.uid)
      .get();

    const deletePromises = posts.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    // Delete user from Firestore
    await db.collection('users').doc(req.params.uid).delete();

    // Delete from Firebase Auth
    try {
      await admin.auth().deleteUser(req.params.uid);
    } catch (error) {
      console.error('Error deleting from Firebase Auth:', error);
    }

    // Log action
    await db.collection('audit_logs').add({
      adminUid: req.user.uid,
      action: 'user_deleted',
      targetType: 'user',
      targetId: req.params.uid,
      details: { 
        userData: userDoc.data(),
        postsDeleted: posts.size
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ 
      message: 'User deleted successfully',
      postsDeleted: posts.size
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/admin/users/:uid/posts
 * Get all posts by a specific user
 */
router.get('/users/:uid/posts', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const snapshot = await db.collection('posts')
      .where('userId', '==', req.params.uid)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .get();

    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ posts });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/admin/flags
 * Get all flagged content
 */
router.get('/flags', async (req, res) => {
  try {
    const { status = 'open', limit = 50 } = req.query;

    let query = db.collection('flags')
      .where('status', '==', status)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit));

    const snapshot = await query.get();

    // Get post data and reporter data for each flag
    const flags = await Promise.all(snapshot.docs.map(async (doc) => {
      const flagData = doc.data();
      
      const postDoc = await db.collection('posts').doc(flagData.postId).get();
      const reporterDoc = await db.collection('users').doc(flagData.reportedBy).get();

      return {
        id: doc.id,
        ...flagData,
        post: postDoc.exists ? { id: postDoc.id, ...postDoc.data() } : null,
        reporter: reporterDoc.exists ? {
          uid: reporterDoc.data().uid,
          displayName: reporterDoc.data().displayName,
          email: reporterDoc.data().email
        } : null
      };
    }));

    res.json({ flags });
  } catch (error) {
    console.error('Error fetching flags:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/admin/flags/:id/resolve
 * Resolve a flag (dismiss or delete post)
 */
router.post('/flags/:id/resolve', async (req, res) => {
  try {
    const { action } = req.body; // 'dismiss' or 'delete'

    if (!['dismiss', 'delete'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use "dismiss" or "delete"' });
    }

    const flagDoc = await db.collection('flags').doc(req.params.id).get();
    
    if (!flagDoc.exists) {
      return res.status(404).json({ message: 'Flag not found' });
    }

    const flagData = flagDoc.data();

    if (action === 'delete') {
      // Delete the post
      const postDoc = await db.collection('posts').doc(flagData.postId).get();
      if (postDoc.exists) {
        await db.collection('posts').doc(flagData.postId).delete();
        
        // Log action
        await db.collection('audit_logs').add({
          adminUid: req.user.uid,
          action: 'post_deleted',
          targetType: 'post',
          targetId: flagData.postId,
          details: { 
            reason: 'flagged_content',
            flagId: req.params.id,
            postData: postDoc.data()
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    // Mark flag as resolved
    await db.collection('flags').doc(req.params.id).update({
      status: 'resolved',
      resolvedBy: req.user.uid,
      resolvedAt: admin.firestore.FieldValue.serverTimestamp(),
      action: action
    });

    res.json({ message: 'Flag resolved successfully' });
  } catch (error) {
    console.error('Error resolving flag:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/admin/audit
 * Get audit logs
 */
router.get('/audit', async (req, res) => {
  try {
    const { limit = 100, startAfter } = req.query;

    let query = db.collection('audit_logs')
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit));

    if (startAfter) {
      const startDoc = await db.collection('audit_logs').doc(startAfter).get();
      if (startDoc.exists) {
        query = query.startAfter(startDoc);
      }
    }

    const snapshot = await query.get();

    // Get admin user data for each log
    const logs = await Promise.all(snapshot.docs.map(async (doc) => {
      const logData = doc.data();
      const adminDoc = await db.collection('users').doc(logData.adminUid).get();

      return {
        id: doc.id,
        ...logData,
        admin: adminDoc.exists ? {
          uid: adminDoc.data().uid,
          displayName: adminDoc.data().displayName,
          email: adminDoc.data().email
        } : null
      };
    }));

    res.json({
      logs,
      hasMore: snapshot.docs.length === parseInt(limit),
      lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/admin/passcodes
 * Get all registration passcodes
 */
router.get('/passcodes', async (req, res) => {
  try {
    const snapshot = await db.collection('passcodes')
      .orderBy('createdAt', 'desc')
      .get();

    const now = new Date();
    const passcodes = snapshot.docs.map(doc => {
      const data = doc.data();
      const expiresAt = data.expiresAt.toDate();
      const isExpired = now > expiresAt;

      return {
        id: doc.id,
        ...data,
        isExpired
      };
    });

    res.json({ passcodes });
  } catch (error) {
    console.error('Error fetching passcodes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/admin/passcodes
 * Create a new registration passcode
 */
router.post('/passcodes', async (req, res) => {
  try {
    const { type = 'user', customPasscode } = req.body;

    // Validate type
    if (!['user', 'admin'].includes(type)) {
      return res.status(400).json({ message: 'Type must be "user" or "admin"' });
    }

    // Generate passcode (use custom or generate random)
    const passcode = customPasscode || generateRandomPasscode();

    // Check if passcode already exists
    const existingPasscode = await db.collection('passcodes')
      .where('passcode', '==', passcode)
      .where('isActive', '==', true)
      .get();

    if (!existingPasscode.empty) {
      return res.status(400).json({ message: 'This passcode already exists' });
    }

    // Set expiration date (5 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 5);

    // Create passcode document
    const passcodeData = {
      passcode,
      type,
      isActive: true,
      usedBy: null,
      createdBy: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt)
    };

    const docRef = await db.collection('passcodes').add(passcodeData);

    // Log action
    await db.collection('audit_logs').add({
      adminUid: req.user.uid,
      action: 'passcode_created',
      targetType: 'passcode',
      targetId: docRef.id,
      details: { type, passcode },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({
      message: 'Passcode created successfully',
      passcode: {
        id: docRef.id,
        ...passcodeData,
        isExpired: false
      }
    });
  } catch (error) {
    console.error('Error creating passcode:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /api/admin/passcodes/:id
 * Deactivate a registration passcode
 */
router.delete('/passcodes/:id', async (req, res) => {
  try {
    const passcodeDoc = await db.collection('passcodes').doc(req.params.id).get();

    if (!passcodeDoc.exists) {
      return res.status(404).json({ message: 'Passcode not found' });
    }

    // Mark as inactive
    await db.collection('passcodes').doc(req.params.id).update({
      isActive: false,
      deactivatedBy: req.user.uid,
      deactivatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Log action
    await db.collection('audit_logs').add({
      adminUid: req.user.uid,
      action: 'passcode_deactivated',
      targetType: 'passcode',
      targetId: req.params.id,
      details: { passcode: passcodeDoc.data().passcode },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ message: 'Passcode deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating passcode:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Helper function to generate random passcode
 */
function generateRandomPasscode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let passcode = '';
  for (let i = 0; i < 12; i++) {
    passcode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return passcode;
}

module.exports = router;
