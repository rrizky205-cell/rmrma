/**
 * Encryption & Token Security Utilities
 */

const SECRET_KEY = process.env.ENCRYPTION_SECRET || 'tatadana-secret-encryption-key-32ch';

/**
 * Encrypt sensitive string (e.g. Bot Token, AI API keys)
 */
export function encryptText(plainText: string): string {
  if (!plainText) return '';
  try {
    const encoded = Buffer.from(plainText, 'utf8');
    const secret = Buffer.from(SECRET_KEY.padEnd(32, '0').slice(0, 32), 'utf8');
    const cipher = Buffer.alloc(encoded.length);
    for (let i = 0; i < encoded.length; i++) {
      cipher[i] = encoded[i] ^ secret[i % secret.length];
    }
    return 'enc_' + cipher.toString('base64');
  } catch (err) {
    console.error('Encryption error:', err);
    return plainText;
  }
}

/**
 * Decrypt sensitive string
 */
export function decryptText(cipherText: string): string {
  if (!cipherText) return '';
  if (!cipherText.startsWith('enc_')) return cipherText;
  try {
    const base64Data = cipherText.replace('enc_', '');
    const cipher = Buffer.from(base64Data, 'base64');
    const secret = Buffer.from(SECRET_KEY.padEnd(32, '0').slice(0, 32), 'utf8');
    const plain = Buffer.alloc(cipher.length);
    for (let i = 0; i < cipher.length; i++) {
      plain[i] = cipher[i] ^ secret[i % secret.length];
    }
    return plain.toString('utf8');
  } catch (err) {
    console.error('Decryption error:', err);
    return cipherText;
  }
}

/**
 * Generate 6-digit OTP code for phone verification
 */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate 6-char alphanumeric Telegram Link code (e.g. TATA78)
 */
export function generateTelegramLinkCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'TATA';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
