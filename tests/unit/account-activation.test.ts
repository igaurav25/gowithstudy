import { describe, it, expect, beforeEach } from "vitest";
import { ApplicationService } from "@/services/application-service";
import { AuthService, StoredUser } from "@/services/auth-service";
import { hashPasswordArgon2 } from "@/lib/crypto-auth";
import {
  checkActivationTokenAction,
  completeActivationAction,
} from "@/features/application/activation-actions";
import { loginWithIdentifierAction } from "@/features/auth/high-assurance-actions";

describe("Unit: Account Activation, Password Setup & Zero-Trust Login Enforcement", () => {
  beforeEach(() => {
    ApplicationService._resetInMemory();
  });

  describe("Token Validation & Password Activation", () => {
    it("should validate an approved application's activation token", async () => {
      // 1. Submit application
      const sub = await ApplicationService.submitStudentApplication({
        fullName: "Pooja Patel",
        email: "pooja.patel@dtu.ac.in",
        phone: "+919876543266",
        college: "DTU",
        course: "B.Tech",
        branch: "CSE",
        year: 2,
        rollNumber: "2K22/CO/555",
      });

      // 2. Approve application
      const appRes = await ApplicationService.approveApplication({
        applicationId: sub.referenceId!,
        reviewerId: "admin_1",
      });
      const rawToken = appRes.rawActivationToken!;

      // 3. Validate token on GET /activate?token=...
      const check = await checkActivationTokenAction(rawToken);
      expect(check.success).toBe(true);
      expect(check.data?.applicantName).toBe("Pooja Patel");
      expect(check.data?.email).toBe("pooja.patel@dtu.ac.in");
    });

    it("should reject invalid, missing or short activation tokens", async () => {
      const check = await checkActivationTokenAction("short_token");
      expect(check.success).toBe(false);
      expect(check.message).toMatch(/invalid/i);
    });

    it("should activate account and set password using Argon2id", async () => {
      const sub = await ApplicationService.submitStudentApplication({
        fullName: "Rahul Varma",
        email: "rahul.varma@dtu.ac.in",
        phone: "+919876543277",
        college: "DTU",
        course: "B.Tech",
        branch: "IT",
        year: 1,
        rollNumber: "2K23/IT/111",
      });

      const appRes = await ApplicationService.approveApplication({
        applicationId: sub.referenceId!,
        reviewerId: "admin_1",
      });
      const rawToken = appRes.rawActivationToken!;

      // Complete activation
      const act = await completeActivationAction({
        token: rawToken,
        password: "NewSecurePassword@2026",
        confirmPassword: "NewSecurePassword@2026",
      });

      expect(act.success).toBe(true);
      expect(act.data?.redirectUrl).toBe("/dashboard");
    });

    it("should reject activation if passwords do not match or length < 10", async () => {
      const act = await completeActivationAction({
        token: "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        password: "short",
        confirmPassword: "short",
      });

      expect(act.success).toBe(false);
      expect(act.message).toMatch(/at least 10 characters/i);
    });
  });

  describe("Zero-Trust Login Enforcement", () => {
    it("should prevent login for accounts in PENDING_ACTIVATION status", async () => {
      const pwHash = await hashPasswordArgon2("Password123!");
      const pendingUser: StoredUser = {
        id: "usr_pending_activation_test",
        name: "Unactivated Student",
        email: "unactivated@dtu.ac.in",
        passwordHash: pwHash,
        role: "STUDENT",
        accountStatus: "PENDING_ACTIVATION",
        college: "DTU",
        course: "B.Tech",
        branch: "CSE",
        year: 1,
        semester: 1,
        emailVerified: false,
        createdAt: new Date(),
      };

      // Mock user in AuthService store
      await AuthService.saveUserDirectly(pendingUser);

      const loginRes = await loginWithIdentifierAction({
        identifier: "unactivated@dtu.ac.in",
        password: "Password123!",
      });

      expect(loginRes.success).toBe(false);
      expect(loginRes.message).toMatch(/not yet activated/i);
    });

    it("should prevent login for suspended accounts", async () => {
      const pwHash = await hashPasswordArgon2("Password123!");
      const suspendedUser: StoredUser = {
        id: "usr_suspended_test",
        name: "Suspended Student",
        email: "suspended@dtu.ac.in",
        passwordHash: pwHash,
        role: "STUDENT",
        accountStatus: "SUSPENDED",
        isSuspended: true,
        college: "DTU",
        course: "B.Tech",
        branch: "CSE",
        year: 2,
        semester: 3,
        emailVerified: true,
        createdAt: new Date(),
      };

      await AuthService.saveUserDirectly(suspendedUser);

      const loginRes = await loginWithIdentifierAction({
        identifier: "suspended@dtu.ac.in",
        password: "Password123!",
      });

      expect(loginRes.success).toBe(false);
      expect(loginRes.message).toMatch(/suspended/i);
    });
  });
});
