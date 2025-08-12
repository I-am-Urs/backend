import crypto from 'crypto';

const algorithm = 'aes-256-cbc';

function getKey() {
  const hex = process.env.AES_SECRET_KEY || '';
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error('Invalid AES_SECRET_KEY. Must be 64 hex characters (32 bytes).');
  }
  return Buffer.from(hex, 'hex');
}

/**
 * Encrypts plaintext using AES-256-CBC.
 * @param {string} text - UTF-8 plaintext
 * @returns {{iv: string, content: string}} - hex iv and hex ciphertext
 */
export function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, getKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), content: encrypted };
}

/**
 * Decrypts AES-256-CBC payload to plaintext.
 * @param {{iv: string, content: string}} payload
 * @returns {string} UTF-8 plaintext
 */
export function decrypt({ iv, content }) {
  const decipher = crypto.createDecipheriv(algorithm, getKey(), Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

