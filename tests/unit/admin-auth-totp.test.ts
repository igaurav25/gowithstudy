import { describe, it, expect } from "vitest";
import {
  generateTotpSecret,
  generateTotpCode,
  verifyTotpCode,
  encryptTotpSecret,
  decryptTotpSecret,
  generateBackupCodes,
  hashBackupCode,
  verifyAndConsumeBackupCode,
  generateTotpUri,
} from "@/lib/totp";

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

    it("should throw authentication error when ciphertext or tag is tampered", () => {
      const secret = generateTotpSecret();
      const encrypted = encryptTotpSecret(secret);

      // Tampered tag
      const badTag = encrypted.tag.replace(/0/g, "1");
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
});
