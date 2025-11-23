const Filter = require('bad-words');
const filter = new Filter();

/**
 * Check if text contains profanity
 */
const containsProfanity = (text) => {
  if (!text) return false;
  return filter.isProfane(text);
};

/**
 * Clean profanity from text (replace with asterisks)
 */
const cleanProfanity = (text) => {
  if (!text) return text;
  return filter.clean(text);
};

module.exports = {
  containsProfanity,
  cleanProfanity
};
