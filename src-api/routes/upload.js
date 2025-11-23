const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * POST /api/upload/image
 * Upload image for posts (CLOUDINARY)
 */
router.post('/image', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'darksphere/posts',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });

    // Create thumbnail transformation URL
    const thumbnailUrl = cloudinary.url(result.public_id, {
      transformation: [
        { width: 400, height: 400, crop: 'fill' },
        { quality: 'auto:low' }
      ]
    });

    // Clean up temporary file
    await fs.unlink(file.path);

    res.json({
      imageUrl: result.secure_url,
      thumbnailUrl: thumbnailUrl,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Image upload error:', error);
    
    // Clean up on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.error('Error cleaning up file:', err);
      }
    }
    
    res.status(500).json({ message: 'Error uploading image' });
  }
});

/**
 * POST /api/upload/avatar
 * Upload user avatar (CLOUDINARY)
 */
router.post('/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'darksphere/avatars',
      public_id: req.user.uid,
      overwrite: true,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });

    // Clean up temporary file
    await fs.unlink(file.path);

    res.json({
      avatarUrl: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    
    // Clean up on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.error('Error cleaning up file:', err);
      }
    }
    
    res.status(500).json({ message: 'Error uploading avatar' });
  }
});

module.exports = router;
