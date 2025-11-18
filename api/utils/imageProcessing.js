const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

/**
 * Create a thumbnail from an image
 * @param {string} inputPath - Path to original image
 * @param {number} width - Thumbnail width (default 300)
 * @param {number} height - Thumbnail height (default 300)
 * @returns {string} - Path to thumbnail
 */
const createThumbnail = async (inputPath, width = 300, height = 300) => {
  try {
    const parsedPath = path.parse(inputPath);
    const thumbnailPath = path.join(parsedPath.dir, `thumb-${parsedPath.name}${parsedPath.ext}`);

    await sharp(inputPath)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    return thumbnailPath;
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    throw error;
  }
};

/**
 * Optimize image for web
 * @param {string} inputPath - Path to original image
 * @param {number} maxWidth - Maximum width (default 1200)
 * @returns {string} - Path to optimized image
 */
const optimizeImage = async (inputPath, maxWidth = 1200) => {
  try {
    const metadata = await sharp(inputPath).metadata();
    
    if (metadata.width <= maxWidth) {
      return inputPath; // No need to optimize
    }

    const parsedPath = path.parse(inputPath);
    const optimizedPath = path.join(parsedPath.dir, `opt-${parsedPath.name}${parsedPath.ext}`);

    await sharp(inputPath)
      .resize(maxWidth, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(optimizedPath);

    // Delete original and rename optimized
    await fs.unlink(inputPath);
    await fs.rename(optimizedPath, inputPath);

    return inputPath;
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw error;
  }
};

/**
 * Delete a file from filesystem
 * @param {string} filePath - Path to file
 */
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

module.exports = {
  createThumbnail,
  optimizeImage,
  deleteFile
};
