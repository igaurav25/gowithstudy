import crypto from "crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Encodes a buffer to RFC 3548 Base32 string.
 */
export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Decodes an RFC 3548 Base32 string to Buffer.
 */
export function base32Decode(input: string): Buffer {
  const cleanInput = input.toUpperCase().replace(/=+$/, "").replace(/\s/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleanInput.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleanInput[i]);
    if (idx === -1) {
      throw new Error(`Invalid Base32 character: ${cleanInput[i]}`);
    }

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generates a 20-byte cryptographically secure Base32 secret for TOTP.
 */
export function generateTotpSecret(): string {
  const bytes = crypto.randomBytes(20);
  return base32Encode(bytes);
}

/**
 * Generates an RFC 6238 TOTP code (HMAC-SHA1, 30s step, 6 digits).
 */
export function generateTotpCode(secretBase32: string, timestampMs: number = Date.now()): string {
  const key = base32Decode(secretBase32);
  const timeStep = 30; // 30 seconds
  const counter = Math.floor(timestampMs / 1000 / timeStep);

  // Counter as 8-byte big-endian buffer
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac("sha1", key);
  hmac.update(counterBuffer);
  const digest = hmac.digest();

  // Dynamic truncation
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, "0");
}

/**
 * Verifies an RFC 6238 TOTP code with time drift window tolerance (default ±1 step = ±30s).
 */
export function verifyTotpCode(
  secretBase32: string,
  token: string,
  window: number = 1,
  timestampMs: number = Date.now()
): boolean {
  const cleanToken = token.trim();
  if (cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) {
    return false;
  }

  const timeStepMs = 30 * 1000;
  for (let w = -window; w <= window; w++) {
    const testTime = timestampMs + w * timeStepMs;
    const generated = generateTotpCode(secretBase32, testTime);
    if (crypto.timingSafeEqual(Buffer.from(cleanToken), Buffer.from(generated))) {
      return true;
    }
  }
  return false;
}

/**
 * Generates an otpauth:// URI for Google Authenticator / Authy QR code setup.
 */
export function generateTotpUri(email: string, secretBase32: string, issuer: string = "GoWithStudy"): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedEmail = encodeURIComponent(email);
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secretBase32}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

// ==============================================================================
// AES-256-GCM TOTP Secret Encryption at Rest
// ==============================================================================

function getEncryptionKey(): Buffer {
  const secret = process.env.ADMIN_TOTP_ENCRYPTION_KEY || process.env.AUTH_SECRET || "gowithstudy-admin-master-encryption-key-32chars";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts Base32 TOTP secret using AES-256-GCM.
 */
export function encryptTotpSecret(secretBase32: string): { ciphertext: string; iv: string; tag: string } {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(secretBase32, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");

  return {
    ciphertext: encrypted,
    iv: iv.toString("hex"),
    tag,
  };
}

/**
 * Decrypts Base32 TOTP secret using AES-256-GCM.
 */
export function decryptTotpSecret(ciphertext: string, iv: string, tag: string): string {
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "hex"));
  decipher.setAuthTag(Buffer.from(tag, "hex"));

  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// ==============================================================================
// 10 One-Time Admin Backup Codes (Hashed with SHA-256)
// ==============================================================================

/**
 * Generates 10 one-time recovery backup codes (e.g. 8492-4912).
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

  for (let i = 0; i < count; i++) {
    const bytes = crypto.randomBytes(8);
    let part1 = "";
    let part2 = "";
    for (let j = 0; j < 4; j++) part1 += chars[bytes[j] % chars.length];
    for (let j = 4; j < 8; j++) part2 += chars[bytes[j] % chars.length];
    codes.push(`${part1}-${part2}`);
  }
  return codes;
}

/**
 * Hashes a backup code using SHA-256 before database persistence.
 */
export function hashBackupCode(code: string): string {
  const normalized = code.trim().toUpperCase().replace(/[\s-]/g, "");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Verifies and burns a one-time backup code, returning remaining hashed codes.
 */
export function verifyAndConsumeBackupCode(
  submittedCode: string,
  hashedBackupCodes: string[]
): { valid: boolean; remainingHashedCodes: string[] } {
  const submittedHash = hashBackupCode(submittedCode);

  const matchIndex = hashedBackupCodes.findIndex((storedHash) => {
    return (
      storedHash.length === submittedHash.length &&
      crypto.timingSafeEqual(Buffer.from(storedHash), Buffer.from(submittedHash))
    );
  });

  if (matchIndex === -1) {
    return { valid: false, remainingHashedCodes: hashedBackupCodes };
  }

  // Code is consumed (burned)
  const remaining = [...hashedBackupCodes];
  remaining.splice(matchIndex, 1);
  return { valid: true, remainingHashedCodes: remaining };
}
