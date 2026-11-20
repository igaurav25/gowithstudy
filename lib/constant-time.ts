import crypto from "crypto";

/**
 * Constant-time comparison of two secret strings to prevent timing attacks and string-length leaks.
 * Always hashes both inputs to 32-byte SHA-256 buffers prior to timingSafeEqual comparison.
 */
export function constantTimeCompare(provided: string, expected: string): boolean {
  if (typeof provided !== "string" || typeof expected !== "string") {
    return false;
  }
  const hashProvided = crypto.createHash("sha256").update(provided).digest();
  const hashExpected = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(hashProvided, hashExpected);
}
