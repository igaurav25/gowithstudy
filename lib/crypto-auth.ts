import crypto from "crypto";
import { hash, verify } from "@node-rs/argon2";
import bcrypt from "bcryptjs";

// Server-side pepper for OTP HMAC hashing; never exposed to client
const OTP_PEPPER =
  process.env.AUTH_OTP_PEPPER ||
  process.env.AUTH_SECRET ||
  "gowithstudy-high-security-pepper-2026";

// Serverless-tuned Argon2id configuration (OWASP compliant: memory-hard, ~40ms on modern CPU)
const ARGON2_CONFIG = {
  algorithm: 2 as const, // 2 = Algorithm.Argon2id (default OWASP recommendation)
  memoryCost: 19456, // 19 MB memory cost
  timeCost: 2, // 2 iterations
  parallelism: 1, // 1 thread (ideal for serverless single-core containers)
};

/**
 * Hashes a plaintext password using Argon2id.
 */
export async function hashPasswordArgon2(password: string): Promise<string> {
  return hash(password, ARGON2_CONFIG);
}

/**
 * Verifies a password against an Argon2id hash.
 * If the hash is an older bcrypt hash ($2a$ or $2b$), verifies via bcrypt and returns needsRehash: true.
 */
export async function verifyPasswordUnified(
  password: string,
  storedHash: string
): Promise<{ isValid: boolean; needsRehash: boolean }> {
  if (!storedHash) return { isValid: false, needsRehash: false };

  // Detect Argon2id hash ($argon2id$)
  if (storedHash.startsWith("$argon2id")) {
    try {
      const isValid = await verify(storedHash, password, ARGON2_CONFIG);
      return { isValid, needsRehash: false };
    } catch {
      return { isValid: false, needsRehash: false };
    }
  }

  // Detect legacy bcrypt hash ($2a$, $2b$, $2y$)
  if (
    storedHash.startsWith("$2a$") ||
    storedHash.startsWith("$2b$") ||
    storedHash.startsWith("$2y$")
  ) {
    try {
      const isValid = await bcrypt.compare(password, storedHash);
      return { isValid, needsRehash: isValid };
    } catch {
      return { isValid: false, needsRehash: false };
    }
  }

  return { isValid: false, needsRehash: false };
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP.
 * Uses Node.js crypto.randomInt (CSPRNG, never Math.random).
 */
export function generateSecureOtp(): string {
  // Generates integer in range [100000, 999999] inclusive
  const num = crypto.randomInt(100000, 1000000);
  return num.toString();
}

/**
 * Computes HMAC-SHA256 of the OTP code bound to the challenge ID and server pepper.
 * The plaintext code is NEVER persisted in the database.
 */
export function hashOtpCode(code: string, challengeId: string): string {
  const hmac = crypto.createHmac("sha256", `${OTP_PEPPER}:${challengeId}`);
  hmac.update(code.trim());
  return hmac.digest("hex");
}

/**
 * Constant-time comparison of a submitted OTP code against the stored HMAC.
 * Prevents timing attacks on the verification endpoint.
 */
export function verifyOtpCode(
  submittedCode: string,
  challengeId: string,
  expectedHmac: string
): boolean {
  if (!submittedCode || !challengeId || !expectedHmac) return false;

  const computedHmac = hashOtpCode(submittedCode, challengeId);
  const bufComputed = Buffer.from(computedHmac, "hex");
  const bufExpected = Buffer.from(expectedHmac, "hex");

  if (bufComputed.length !== bufExpected.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufComputed, bufExpected);
}

/**
 * Generates a high-entropy device token and returns its hash for database storage.
 */
export function generateDeviceToken(): { rawToken: string; tokenHash: string } {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto
    .createHmac("sha256", OTP_PEPPER)
    .update(rawToken)
    .digest("hex");
  return { rawToken, tokenHash };
}

/**
 * Verifies a raw device cookie token against its stored hash.
 */
export function verifyDeviceToken(
  rawToken: string,
  storedTokenHash: string
): boolean {
  if (!rawToken || !storedTokenHash) return false;
  const computed = crypto
    .createHmac("sha256", OTP_PEPPER)
    .update(rawToken)
    .digest("hex");

  const bufComputed = Buffer.from(computed, "hex");
  const bufExpected = Buffer.from(storedTokenHash, "hex");

  if (bufComputed.length !== bufExpected.length) return false;
  return crypto.timingSafeEqual(bufComputed, bufExpected);
}

/**
 * Anonymizes an IP address for privacy-preserving audit logging and rate limiting.
 */
export function hashIpAddress(ip: string): string {
  const salt = process.env.AUTH_SECRET || "gowithstudy-ip-salt";
  return crypto.createHmac("sha256", salt).update(ip).digest("hex").slice(0, 32);
}
