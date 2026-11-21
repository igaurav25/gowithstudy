import { describe, it, expect } from "vitest";
import {
  generateTotpSecret,
  generateTotpCode,
  verifyTotpCode,
  verifyTotpWithReplay,
  encryptTotpSecret,
  decryptTotpSecret,
  generateBackupCodes,
  hashBackupCode,
  verifyAndConsumeBackupCode,
  generateTotpUri,
  verifyEncryptionCanary,
} from "@/lib/totp";
import {
  checkAdminProgressiveBackoff,
  recordAdminFailedAttempt,
  resetAdminFailedAttempts,
} from "@/lib/redis-rate-limit";

describe("Unit: RFC 6238 TOTP, AES-256-GCM & Admin Backup Codes", () => {
  describe("RFC 6238 TOTP Generation & Verification", () => {
    it("should generate a valid 32-character Base32 secret", () => {
      const secret = generateTotpSecret();
      expect(secret).toHaveLength(32);
      expect(/^[A-Z2-7]+$/.test(secret)).toBe(true);
    });

    it("should generate a 6-digit numeric TOTP code", () => {
      const secret = generateTotpSecret();
      const code = generateTotpCode(secret);
      expect(code).toHaveLength(6);
      expect(/^\d{6}$/.test(code)).toBe(true);
    });

    it("should verify valid TOTP code in real-time and within drift window (±30s)", () => {
      const secret = generateTotpSecret();
      const now = Date.now();
      const codeCurrent = generateTotpCode(secret, now);

      expect(verifyTotpCode(secret, codeCurrent, 1, now)).toBe(true);

      // Past 25 seconds (within same or adjacent step)
      const pastTime = now - 25 * 1000;
      const codePast = generateTotpCode(secret, pastTime);
      expect(verifyTotpCode(secret, codePast, 1, now)).toBe(true);

      // Future 25 seconds
      const futureTime = now + 25 * 1000;
      const codeFuture = generateTotpCode(secret, futureTime);
      expect(verifyTotpCode(secret, codeFuture, 1, now)).toBe(true);

      // Replay prevention test: once a time step is accepted, reused code is rejected
      const replayCheck1 = verifyTotpWithReplay(secret, codeCurrent, 1, now);
      expect(replayCheck1.valid).toBe(true);
      expect(replayCheck1.acceptedTimeStep).toBeDefined();

      // Subsequent attempt with same code and step <= acceptedTimeStep is blocked
      const replayCheck2 = verifyTotpWithReplay(
        secret,
        codeCurrent,
        1,
        now,
        replayCheck1.acceptedTimeStep
      );
      expect(replayCheck2.valid).toBe(false);

      // Reject codes from outside drift window (e.g. 2 minutes ago)
      const oldTime = now - 120 * 1000;
      const codeOld = generateTotpCode(secret, oldTime);
      expect(verifyTotpCode(secret, codeOld, 1, now)).toBe(false);

      // Reject invalid or malformed codes
      expect(verifyTotpCode(secret, "12345", 1, now)).toBe(false);
      expect(verifyTotpCode(secret, "abcdef", 1, now)).toBe(false);
    });

    it("should format valid otpauth:// setup URI", () => {
      const secret = "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP";
      const uri = generateTotpUri("admin@gowithstudy.app", secret);
      expect(uri).toContain("otpauth://totp/GoWithStudy:admin%40gowithstudy.app");
      expect(uri).toContain(`secret=${secret}`);
      expect(uri).toContain("digits=6");
    });
  });

  describe("AES-256-GCM Secret Encryption at Rest", () => {
    it("should encrypt and decrypt TOTP secret with integrity authentication", () => {
      const secret = generateTotpSecret();
      const encrypted = encryptTotpSecret(secret);

      expect(encrypted.ciphertext).toBeDefined();
      expect(encrypted.iv).toHaveLength(24); // 12 bytes = 24 hex chars
      expect(encrypted.tag).toHaveLength(32); // 16 bytes = 32 hex chars

      const decrypted = decryptTotpSecret(
        encrypted.ciphertext,
        encrypted.iv,
        encrypted.tag
      );
      expect(decrypted).toBe(secret);
    });

    it("should encrypt and decrypt with AAD binding (user ID) and fail if AAD mismatches", () => {
      const secret = generateTotpSecret();
      const userId = "usr_super_admin_42";
      const encrypted = encryptTotpSecret(secret, userId);

      // Decrypt with correct AAD succeeds
      const decrypted = decryptTotpSecret(
        encrypted.ciphertext,
        encrypted.iv,
        encrypted.tag,
        userId
      );
      expect(decrypted).toBe(secret);

      // Decrypt with incorrect AAD fails authentication
      expect(() =>
        decryptTotpSecret(encrypted.ciphertext, encrypted.iv, encrypted.tag, "usr_attacker")
      ).toThrow();
    });

    it("should verify encryption canary round trip", () => {
      expect(verifyEncryptionCanary()).toBe(true);
    });

    it("should throw authentication error when ciphertext or tag is tampered", () => {
      const secret = generateTotpSecret();
      const encrypted = encryptTotpSecret(secret);

      // Tampered tag: modify first hex char
      const badTag = (encrypted.tag[0] === "a" ? "b" : "a") + encrypted.tag.slice(1);
      expect(() =>
        decryptTotpSecret(encrypted.ciphertext, encrypted.iv, badTag)
      ).toThrow();
    });
  });

  describe("10 One-Time Backup Codes", () => {
    it("should generate 10 distinct backup codes and verify one-time consumption", () => {
      const backupCodes = generateBackupCodes(10);
      expect(backupCodes).toHaveLength(10);

      const hashedCodes = backupCodes.map(hashBackupCode);
      expect(hashedCodes).toHaveLength(10);

      // Consume first code
      const codeToUse = backupCodes[0];
      const result1 = verifyAndConsumeBackupCode(codeToUse, hashedCodes);
      expect(result1.valid).toBe(true);
      expect(result1.remainingHashedCodes).toHaveLength(9);

      // Re-using the same consumed code should fail
      const result2 = verifyAndConsumeBackupCode(codeToUse, result1.remainingHashedCodes);
      expect(result2.valid).toBe(false);
      expect(result2.remainingHashedCodes).toHaveLength(9);
    });
  });

  describe("Progressive Backoff & Non-Lockout Protection", () => {
    it("should enforce progressive backoff delays without permanent account lock", async () => {
      const testIp = "192.168.1.99";
      await resetAdminFailedAttempts(testIp);

      // 0 attempts -> 0s delay
      const initial = await checkAdminProgressiveBackoff(testIp);
      expect(initial.allowed).toBe(true);
      expect(initial.delaySeconds).toBe(0);
      expect(initial.requiresTurnstile).toBe(false);

      // Record 3 failed attempts -> 5s delay + Turnstile
      await recordAdminFailedAttempt(testIp);
      await recordAdminFailedAttempt(testIp);
      await recordAdminFailedAttempt(testIp);

      const after3 = await checkAdminProgressiveBackoff(testIp);
      expect(after3.allowed).toBe(true);
      expect(after3.delaySeconds).toBe(5);
      expect(after3.requiresTurnstile).toBe(true);

      // Record more attempts -> increases to 15s delay
      await recordAdminFailedAttempt(testIp);
      await recordAdminFailedAttempt(testIp);
      const after5 = await checkAdminProgressiveBackoff(testIp);
      expect(after5.delaySeconds).toBe(15);
      expect(after5.requiresTurnstile).toBe(true);

      // Reset on success
      await resetAdminFailedAttempts(testIp);
      const afterReset = await checkAdminProgressiveBackoff(testIp);
      expect(afterReset.delaySeconds).toBe(0);
      expect(afterReset.requiresTurnstile).toBe(false);
    });
  });
});
