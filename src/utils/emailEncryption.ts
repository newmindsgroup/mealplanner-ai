// Simple encryption/decryption for storing SMTP password
// Note: This is client-side encryption for localStorage.
// In production, use environment variables or secure backend storage.

const ENCRYPTION_KEY = 'mealplan-assistant-email-2024'; // In production, use env variable

/**
 * Simple XOR-based encryption for password storage
 * This is better than plain text but still not suitable for highly sensitive data
 * For production, consider using a backend to store credentials securely
 */
export function encryptPassword(password: string): string {
  if (!password) return '';
  
  try {
    const encrypted = btoa(
      password
        .split('')
        .map((char, i) => 
          String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
        )
        .join('')
    );
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return password; // Fallback to plain text if encryption fails
  }
}

/**
 * Decrypt password from storage
 */
export function decryptPassword(encrypted: string): string {
  if (!encrypted) return '';
  
  try {
    const decrypted = atob(encrypted)
      .split('')
      .map((char, i) =>
        String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
      )
      .join('');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encrypted; // Fallback to returning as-is if decryption fails
  }
}

/**
 * Generic string encryption (can be used for API keys, passwords, etc.)
 */
export function encryptString(str: string): string {
  return encryptPassword(str);
}

/**
 * Generic string decryption
 */
export function decryptString(encrypted: string): string {
  return decryptPassword(encrypted);
}

/**
 * Mask password for display (show first 2 and last 2 characters)
 */
export function maskPassword(password: string): string {
  if (!password) return '';
  if (password.length <= 6) return '*'.repeat(password.length);
  
  const firstTwo = password.substring(0, 2);
  const lastTwo = password.substring(password.length - 2);
  const middleLength = password.length - 4;
  
  return `${firstTwo}${'*'.repeat(middleLength)}${lastTwo}`;
}

/**
 * Validate email address format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Security warning for users about password storage
 */
export const SECURITY_WARNING = `
⚠️ Security Notice:
Your SMTP credentials are encrypted and stored locally in your browser.
For maximum security:
1. Use app-specific passwords (not your main email password)
2. Enable 2-factor authentication on your email account
3. Consider using dedicated email services like SendGrid or Mailgun
4. Never share your SMTP credentials
`.trim();

