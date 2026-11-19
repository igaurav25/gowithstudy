import { describe, it, expect } from "vitest";
import {
  hashPasswordArgon2,
  verifyPasswordUnified,
  generateSecureOtp,
  hashOtpCode,
  verifyOtpCode,
  generateDeviceToken,
  verifyDeviceToken,
  hashIpAddress,
} from "@/lib/crypto-auth";
import {
  canonicalizeEmail,
  isDisposableEmail,
  canonicalizePhone,
  maskEmail,
  maskPhone,
} from "@/lib/canonicalize";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { checkPwnedPassword } from "@/lib/pwned-password";
import bcrypt from "bcryptjs";

describe("Unit: High-Assurance Crypto, OTP & Contact Canonicalization (Auth System)", () => {
  describe("Argon2id Password Hashing & Unified Legacy Migration", () => {
    it("should hash passwords using Argon2id with valid $argon2id$ prefix", async () => {
      const password = "SuperSecretStudentPassword123!";
      const hash = await hashPasswordArgon2(password);

      expect(hash).toContain("$argon2id$");
      expect(hash.length).toBeGreaterThan(50);

      // Verify correct password
      const result = await verifyPasswordUnified(password, hash);
      expect(result.isValid).toBe(true);
      expect(result.needsRehash).toBe(false);

      // Rejects incorrect password
      const wrongResult = await verifyPasswordUnified("WrongPassword!", hash);
      expect(wrongResult.isValid).toBe(false);
    });

    it("should transparently verify legacy bcrypt hashes and flag them for rehashing", async () => {
      const password = "OldBcryptPassword2024!";
      const salt = await bcrypt.genSalt(10);
      const legacyBcryptHash = await bcrypt.hash(password, salt);

      expect(legacyBcryptHash.startsWith("$2a$") || legacyBcryptHash.startsWith("$2b$")).toBe(true);

      const verification = await verifyPasswordUnified(password, legacyBcryptHash);
      expect(verification.isValid).toBe(true);
      expect(verification.needsRehash).toBe(true); // Must rehash to Argon2id

      // Wrong password against bcrypt hash
      const wrongVerification = await verifyPasswordUnified("Incorrect!", legacyBcryptHash);
      expect(wrongVerification.isValid).toBe(false);
      expect(wrongVerification.needsRehash).toBe(false);
    });
  });

  describe("CSPRNG OTP Generation & HMAC-SHA256 Verification", () => {
    it("should generate cryptographically secure 6-digit numeric OTP codes", () => {
      for (let i = 0; i < 50; i++) {
        const otp = generateSecureOtp();
        expect(otp).toMatch(/^\d{6}$/);
        const num = parseInt(otp, 10);
        expect(num).toBeGreaterThanOrEqual(100000);
        expect(num).toBeLessThanOrEqual(999999);
      }
    });

    it("should hash and verify OTP codes using constant-time HMAC comparison", () => {
      const challengeId = "clg_test_challenge_123";
      const code = "849201";

      const hmac = hashOtpCode(code, challengeId);
      expect(hmac.length).toBe(64); // SHA-256 hex length

      // Correct code and challengeId
      expect(verifyOtpCode(code, challengeId, hmac)).toBe(true);

      // Incorrect code
      expect(verifyOtpCode("849200", challengeId, hmac)).toBe(false);

      // Different challengeId (prevents replay across challenges)
      expect(verifyOtpCode(code, "clg_different_456", hmac)).toBe(false);

      // Empty or invalid inputs
      expect(verifyOtpCode("", challengeId, hmac)).toBe(false);
    });
  });

  describe("Device Token Generation & Privacy-Preserving Hashing", () => {
    it("should generate and verify rotating high-entropy device tokens", () => {
      const { rawToken, tokenHash } = generateDeviceToken();
      expect(rawToken.length).toBe(64);
      expect(tokenHash.length).toBe(64);

      expect(verifyDeviceToken(rawToken, tokenHash)).toBe(true);
      expect(verifyDeviceToken("tampered_raw_token", tokenHash)).toBe(false);
    });

    it("should generate consistent anonymized IP hashes", () => {
      const ip = "192.168.1.100";
      const hash1 = hashIpAddress(ip);
      const hash2 = hashIpAddress(ip);
      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(32);
      expect(hash1).not.toBe(ip);
    });
  });

  describe("Gmail Canonicalization & Deduplication", () => {
    it("should canonicalize Gmail addresses by stripping dots and +alias suffixes", () => {
      expect(canonicalizeEmail("rahul.sharma@gmail.com")).toBe("rahulsharma@gmail.com");
      expect(canonicalizeEmail("r.a.h.u.l.sharma@gmail.com")).toBe("rahulsharma@gmail.com");
      expect(canonicalizeEmail("rahul+study2026@gmail.com")).toBe("rahul@gmail.com");
      expect(canonicalizeEmail("rahul.sharma+notes@gmail.com")).toBe("rahulsharma@gmail.com");
      expect(canonicalizeEmail("rahul.sharma@googlemail.com")).toBe("rahulsharma@gmail.com");
      expect(canonicalizeEmail("  RAHUL.SHARMA@GMAIL.COM  ")).toBe("rahulsharma@gmail.com");
    });

    it("should preserve non-Gmail provider structure while trimming and lowercasing", () => {
      expect(canonicalizeEmail("student.cse@dtu.ac.in")).toBe("student.cse@dtu.ac.in");
      expect(canonicalizeEmail("john.doe@outlook.com")).toBe("john.doe@outlook.com");
    });

    it("should detect and reject disposable / throwaway email domains", () => {
      expect(isDisposableEmail("attacker@tempmail.com")).toBe(true);
      expect(isDisposableEmail("bot@mailinator.com")).toBe(true);
      expect(isDisposableEmail("fake@10minutemail.com")).toBe(true);
      expect(isDisposableEmail("student@gmail.com")).toBe(false);
      expect(isDisposableEmail("student@dtu.ac.in")).toBe(false);
    });
  });

  describe("Phone E.164 Normalization (libphonenumber-js)", () => {
    it("should parse and normalize valid 10-digit Indian mobile numbers to strict E.164", () => {
      const res1 = canonicalizePhone("9876543210");
      expect(res1.isValid).toBe(true);
      expect(res1.e164).toBe("+919876543210");
      expect(res1.countryCode).toBe("+91");
      expect(res1.nationalNumber).toBe("9876543210");

      const res2 = canonicalizePhone("+91 98765-43210");
      expect(res2.isValid).toBe(true);
      expect(res2.e164).toBe("+919876543210");

      const res3 = canonicalizePhone("09876543210");
      expect(res3.isValid).toBe(true);
      expect(res3.e164).toBe("+919876543210");
    });

    it("should reject invalid phone numbers with clear error messages", () => {
      const res1 = canonicalizePhone("12345");
      expect(res1.isValid).toBe(false);
      expect(res1.errorMessage).toBeDefined();

      const res2 = canonicalizePhone("");
      expect(res2.isValid).toBe(false);
      expect(res2.errorMessage).toContain("required");
    });
  });

  describe("Privacy Masking for Logs & UI", () => {
    it("should mask email addresses appropriately", () => {
      expect(maskEmail("rahul.sharma@gmail.com")).toBe("ra***@gmail.com");
      expect(maskEmail("ab@college.edu")).toBe("a***@college.edu");
    });

    it("should mask E.164 phone numbers appropriately", () => {
      expect(maskPhone("+919876543210")).toBe("+9198****3210");
    });
  });

  describe("Bot Defense (Turnstile) & Breached Password Check (HIBP)", () => {
    it("should verify Turnstile tokens in test/dev environment", async () => {
      const result = await verifyTurnstileToken("dummy_test_token");
      expect(result.success).toBe(true);
    });

    it("should check pwned passwords without throwing and handle offline mode", async () => {
      const result = await checkPwnedPassword("TestPassword123!");
      expect(result).toHaveProperty("isBreached");
      expect(result).toHaveProperty("breachCount");
    });
  });
});
