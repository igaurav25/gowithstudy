import { describe, it, expect } from "vitest";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "@/schemas/auth";
import {
  hashPassword,
  comparePassword,
  createSessionToken,
  verifySessionToken,
  SESSION_DURATION_DEFAULT,
  SESSION_DURATION_REMEMBER,
} from "@/lib/auth";

describe("Unit: Authentication & Credential Security", () => {
  describe("Zod Validation Schemas", () => {
    it("should accept valid student signup input", () => {
      const validInput = {
        name: "Aarav Sharma",
        email: "aarav.sharma@campusflow.edu",
        password: "SecurePassword123!",
        confirmPassword: "SecurePassword123!",
        college: "Delhi Technological University",
        course: "B.Tech",
        branch: "Computer Science & Engineering",
        year: 3,
        semester: 6,
      };

      const result = signupSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should reject signup when passwords do not match", () => {
      const input = {
        name: "Aarav Sharma",
        email: "aarav@campusflow.edu",
        password: "SecurePassword123!",
        confirmPassword: "MismatchPassword999!",
        college: "DTU",
        course: "B.Tech",
        branch: "CSE",
        year: 3,
        semester: 6,
      };

      const result = signupSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passwords do not match");
      }
    });

    it("should reject weak passwords (missing special char or uppercase)", () => {
      const weakPasswords = [
        "weakpassword1", // no uppercase, no special char
        "WEAKPASSWORD1!", // no lowercase
        "Weakpass!", // too short (<8 chars)
        "Weakpassword", // no special char, no number
      ];

      for (const pwd of weakPasswords) {
        const input = {
          name: "Test User",
          email: "test@campusflow.edu",
          password: pwd,
          confirmPassword: pwd,
          college: "DTU",
          course: "B.Tech",
          branch: "CSE",
          year: 2,
          semester: 4,
        };
        const result = signupSchema.safeParse(input);
        expect(result.success).toBe(false);
      }
    });

    it("should reject invalid email formats", () => {
      const invalidEmails = ["notanemail", "user@", "@domain.com", "user@domain..com"];
      for (const email of invalidEmails) {
        const result = loginSchema.safeParse({ email, password: "Password123!" });
        expect(result.success).toBe(false);
      }
    });

    it("should validate forgot password and reset password schemas", () => {
      expect(forgotPasswordSchema.safeParse({ email: "user@campusflow.edu" }).success).toBe(true);
      expect(forgotPasswordSchema.safeParse({ email: "invalid" }).success).toBe(false);

      const validReset = {
        token: "sample-reset-token-12345",
        password: "NewSecurePassword123!",
        confirmPassword: "NewSecurePassword123!",
      };
      expect(resetPasswordSchema.safeParse(validReset).success).toBe(true);

      const mismatchedReset = {
        token: "token",
        password: "NewSecurePassword123!",
        confirmPassword: "DifferentPassword123!",
      };
      expect(resetPasswordSchema.safeParse(mismatchedReset).success).toBe(false);

      expect(verifyEmailSchema.safeParse({ token: "tok123" }).success).toBe(true);
      expect(verifyEmailSchema.safeParse({ token: "" }).success).toBe(false);
    });
  });

  describe("Password Hashing & Verification (bcrypt)", () => {
    it("should hash a plaintext password and verify correctly", async () => {
      const plaintext = "CampusFlow2026!Secure";
      const hash = await hashPassword(plaintext);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(plaintext);
      expect(hash.startsWith("$2")).toBe(true);

      const isMatch = await comparePassword(plaintext, hash);
      expect(isMatch).toBe(true);

      const isWrongMatch = await comparePassword("WrongPassword123!", hash);
      expect(isWrongMatch).toBe(false);
    });
  });

  describe("JWT Session Tokens (jose)", () => {
    const mockSession = {
      userId: "usr_test_123",
      email: "student@campusflow.edu",
      name: "Rohan Verma",
      role: "USER" as const,
      sessionId: "ses_abc_999",
    };

    it("should sign and verify valid JWT session token", async () => {
      const token = await createSessionToken(mockSession, 3600);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      const verified = await verifySessionToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(mockSession.userId);
      expect(verified?.email).toBe(mockSession.email);
      expect(verified?.role).toBe("USER");
    });

    it("should reject tampered or malformed tokens", async () => {
      const token = await createSessionToken(mockSession, 3600);
      const tampered = token.slice(0, -6) + "xxxxxx";

      const verified = await verifySessionToken(tampered);
      expect(verified).toBeNull();

      const invalidToken = await verifySessionToken("not-a-real-jwt");
      expect(invalidToken).toBeNull();
    });

    it("should reject expired session tokens", async () => {
      // Create a token expired 10 seconds ago
      const expiredToken = await createSessionToken(mockSession, -10);
      const verified = await verifySessionToken(expiredToken);
      expect(verified).toBeNull();
    });

    it("should observe correct persistent session lifetimes", () => {
      expect(SESSION_DURATION_DEFAULT).toBe(7 * 24 * 60 * 60); // 7 days
      expect(SESSION_DURATION_REMEMBER).toBe(30 * 24 * 60 * 60); // 30 days
    });
  });
});
