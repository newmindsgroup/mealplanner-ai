// Encryption utilities for sensitive data (API keys)
const crypto = require('crypto');
const config = require('../config/config');

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = Buffer.from(config.encryption.key.slice(0, 32).padEnd(32, '0'));

/**
 * Encrypt sensitive data (like API keys)
 * @param {string} text - Text to encrypt
 * @returns {{encrypted: string, iv: string}} Encrypted data and IV
 */
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    encrypted,
    iv: iv.toString('hex'),
  };
}

/**
 * Decrypt sensitive data
 * @param {string} encrypted - Encrypted text
 * @param {string} ivHex - IV in hex format
 * @returns {string} Decrypted text
 */
function decrypt(encrypted, ivHex) {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Generate a random token (for password reset, email verification, etc.)
 * @param {number} length - Length of token
 * @returns {string} Random token
 */
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a token (for storing in database)
 * @param {string} token - Token to hash
 * @returns {string} Hashed token
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  encrypt,
  decrypt,
  generateToken,
  hashToken,
};

