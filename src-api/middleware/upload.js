const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/jpg').split(',');
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and JPG are allowed.'), false);
  }
};

// Size limit from environment
const maxSize = (parseInt(process.env.MAX_IMAGE_SIZE_MB) || 5) * 1024 * 1024;

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: maxSize
  }
});

module.exports = upload;
