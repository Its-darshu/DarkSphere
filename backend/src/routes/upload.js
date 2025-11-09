const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { createThumbnail, optimizeImage } = require('../utils/imageProcessing');
const path = require('path');
const fs = require('fs').promises;

// Create public directories if they don't exist
const initializeDirectories = async () => {
  const dirs = [
    path.join(__dirname, '../../public'),
    path.join(__dirname, '../../public/posts'),
    path.join(__dirname, '../../public/posts/thumbnails'),
    path.join(__dirname, '../../public/avatars')
  ];
  
  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (err) {
      console.error(`Error creating directory ${dir}:`, err);
    }
  }
};

initializeDirectories();

/**
 * POST /api/upload/image
 * Upload image for posts (LOCAL STORAGE)
 */
router.post('/image', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;
    const fileName = `${Date.now()}-${path.basename(file.filename)}`;
    const publicDir = path.join(__dirname, '../../public');
    
    // Destination paths
    const destPath = path.join(publicDir, 'posts', fileName);
    const thumbnailName = `thumb-${fileName}`;
    const thumbnailDestPath = path.join(publicDir, 'posts/thumbnails', thumbnailName);

    // Optimize image
    await optimizeImage(file.path);

    // Create thumbnail
    const thumbnailPath = await createThumbnail(file.path);

    // Move files to public directory
    await fs.rename(file.path, destPath);
    await fs.rename(thumbnailPath, thumbnailDestPath);

    // Generate URLs (relative to backend server)
    const baseUrl = process.env.API_URL || 'http://localhost:5000';
    const imageUrl = `${baseUrl}/uploads/posts/${fileName}`;
    const thumbnailUrl = `${baseUrl}/uploads/posts/thumbnails/${thumbnailName}`;

    res.json({
      imageUrl,
      thumbnailUrl,
      fileName
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
 * Upload user avatar (LOCAL STORAGE)
 */
router.post('/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;
    const fileName = `${req.user.uid}-${Date.now()}${path.extname(file.filename)}`;
    const publicDir = path.join(__dirname, '../../public');
    const destPath = path.join(publicDir, 'avatars', fileName);

    // Optimize image
    await optimizeImage(file.path, 400);

    // Move file to public directory
    await fs.rename(file.path, destPath);

    // Generate URL
    const baseUrl = process.env.API_URL || 'http://localhost:5000';
    const avatarUrl = `${baseUrl}/uploads/avatars/${fileName}`;

    res.json({
      avatarUrl,
      fileName
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
