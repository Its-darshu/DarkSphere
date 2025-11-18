const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { verifyToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { validatePost, sanitizeText } = require('../utils/validation');
const { containsProfanity } = require('../utils/profanityFilter');

// Get Firestore instance
const db = admin.firestore();

/**
 * GET /api/posts
 * Get posts feed with pagination and filtering
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const { 
      limit = 20, 
      startAfter, 
      category, 
      featured 
    } = req.query;

    // Build query - start with just ordering by createdAt (descending)
    let query = db.collection('posts').orderBy('createdAt', 'desc');

    // Filter by category if provided and not 'all'
    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }

    // Filter featured posts if requested
    if (featured === 'true') {
      query = query.where('featured', '==', true);
    }

    // Pagination
    if (startAfter) {
      const startDoc = await db.collection('posts').doc(startAfter).get();
      if (startDoc.exists) {
        query = query.startAfter(startDoc);
      }
    }

    query = query.limit(parseInt(limit));

    const snapshot = await query.get();
    
    // Get user data for each post
    const posts = await Promise.all(snapshot.docs.map(async (doc) => {
      const postData = doc.data();
      const userDoc = await db.collection('users').doc(postData.userId).get();
      
      return {
        id: doc.id,
        ...postData,
        user: userDoc.exists ? {
          uid: userDoc.data().uid,
          displayName: userDoc.data().displayName,
          photoURL: userDoc.data().photoURL,
          role: userDoc.data().role
        } : null,
        createdAt: postData.createdAt
      };
    }));

    res.json({
      posts,
      hasMore: snapshot.docs.length === parseInt(limit),
      lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/posts/:id
 * Get single post
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const postDoc = await db.collection('posts').doc(req.params.id).get();
    
    if (!postDoc.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const postData = postDoc.data();
    const userDoc = await db.collection('users').doc(postData.userId).get();

    res.json({
      id: postDoc.id,
      ...postData,
      user: userDoc.exists ? {
        uid: userDoc.data().uid,
        displayName: userDoc.data().displayName,
        photoURL: userDoc.data().photoURL,
        role: userDoc.data().role
      } : null
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/posts
 * Create a new post
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { text, imageUrl, thumbnailUrl, category } = req.body;

    // Validate
    const validation = validatePost(text, imageUrl);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    // Sanitize text
    const sanitizedText = sanitizeText(text);

    // Check for profanity
    if (sanitizedText && containsProfanity(sanitizedText)) {
      return res.status(400).json({ message: 'Post contains inappropriate language' });
    }

    const postData = {
      userId: req.user.uid,
      text: sanitizedText,
      imageUrl: imageUrl || null,
      thumbnailUrl: thumbnailUrl || null,
      category: category || 'general',
      approved: true, // Auto-approve for now
      featured: false,
      flagCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const postRef = await db.collection('posts').add(postData);

    res.status(201).json({
      id: postRef.id,
      ...postData
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /api/posts/:id
 * Delete a post (own post or admin)
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const postDoc = await db.collection('posts').doc(req.params.id).get();
    
    if (!postDoc.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const postData = postDoc.data();

    // Check if user owns the post or is admin
    if (postData.userId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete images from storage if they exist
    if (postData.imageUrl) {
      try {
        const imagePath = postData.imageUrl.split('/').pop().split('?')[0];
        await storage.file(`posts/${imagePath}`).delete();
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }

    if (postData.thumbnailUrl) {
      try {
        const thumbPath = postData.thumbnailUrl.split('/').pop().split('?')[0];
        await storage.file(`posts/thumbnails/${thumbPath}`).delete();
      } catch (err) {
        console.error('Error deleting thumbnail:', err);
      }
    }

    await db.collection('posts').doc(req.params.id).delete();

    // Log if admin deleted
    if (req.user.role === 'admin' && postData.userId !== req.user.uid) {
      await db.collection('audit_logs').add({
        adminUid: req.user.uid,
        action: 'post_deleted',
        targetType: 'post',
        targetId: req.params.id,
        details: { postData },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/posts/:id/flag
 * Flag a post as inappropriate
 */
router.post('/:id/flag', verifyToken, async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    const postDoc = await db.collection('posts').doc(req.params.id).get();
    
    if (!postDoc.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already flagged this post
    const existingFlag = await db.collection('flags')
      .where('postId', '==', req.params.id)
      .where('reportedBy', '==', req.user.uid)
      .where('status', '==', 'open')
      .get();

    if (!existingFlag.empty) {
      return res.status(400).json({ message: 'You have already flagged this post' });
    }

    // Create flag
    await db.collection('flags').add({
      postId: req.params.id,
      reportedBy: req.user.uid,
      reason: sanitizeText(reason),
      status: 'open',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Increment flag count
    await db.collection('posts').doc(req.params.id).update({
      flagCount: admin.firestore.FieldValue.increment(1)
    });

    res.json({ message: 'Post flagged successfully' });
  } catch (error) {
    console.error('Error flagging post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
