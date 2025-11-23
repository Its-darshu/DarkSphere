/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize text input (remove dangerous characters)
 */
const sanitizeText = (text) => {
  if (!text) return '';
  return text.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

/**
 * Validate post content
 */
const validatePost = (text, imageUrl) => {
  const errors = [];

  if (!text && !imageUrl) {
    errors.push('Post must contain either text or an image');
  }

  if (text && text.length > 5000) {
    errors.push('Text cannot exceed 5000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate user profile data
 */
const validateProfile = (displayName, email) => {
  const errors = [];

  if (!displayName || displayName.trim().length < 2) {
    errors.push('Display name must be at least 2 characters');
  }

  if (displayName && displayName.length > 50) {
    errors.push('Display name cannot exceed 50 characters');
  }

  if (email && !isValidEmail(email)) {
    errors.push('Invalid email format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  isValidEmail,
  sanitizeText,
  validatePost,
  validateProfile
};
