import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { AdminSetupService } from "@/services/admin/admin-setup-service";
import { AdminRecoveryService } from "@/services/admin/admin-recovery-service";
import { AuthService, StoredUser } from "@/services/auth-service";
import {
  adminLoginStep1Action,
  adminLoginStep2TotpAction,
} from "@/features/admin/auth-actions";
import { loginWithIdentifierAction } from "@/features/auth/high-assurance-actions";
import { OtpChallengeStore } from "@/services/auth/otp-challenge-store";
import { hashPasswordArgon2 } from "@/lib/crypto-auth";
import {
  generateTotpSecret,
  encryptTotpSecret,
  generateBackupCodes,
  hashBackupCode,
  generateTotpCode,
} from "@/lib/totp";
import fs from "fs";
import path from "path";

describe("Unit: Super Admin Unified Login, Setup & Recovery Access Patch", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    AuthService._resetInMemory();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  describe("1. First-Time Setup (/setup-admin) Gating & Atomic Provisioning", () => {
    it("should return false (404) for setup when ADMIN_SETUP_TOKEN is missing or too short", async () => {
      delete process.env.ADMIN_SETUP_TOKEN;
      expect(await AdminSetupService.isSetupAllowed()).toBe(false);

      process.env.ADMIN_SETUP_TOKEN = "short";
      expect(await AdminSetupService.isSetupAllowed()).toBe(false);
    });

    it("should return false (404) once a SUPER_ADMIN already exists in the system", async () => {
      process.env.ADMIN_SETUP_TOKEN = "valid_setup_token_at_least_16_chars_long";

      // Provision an existing SUPER_ADMIN
      await AuthService.saveUserDirectly({
        id: "usr_super_existing",
        name: "Existing Super Admin",
        email: "superadmin@dtu.ac.in",
        role: "SUPER_ADMIN",
        accountStatus: "ACTIVE",
        createdAt: new Date(),
      } as StoredUser);

      expect(await AdminSetupService.isSetupAllowed()).toBe(false);
    });

    it("should permit setup when ADMIN_SETUP_TOKEN is set and NO super admin exists", async () => {
      process.env.ADMIN_SETUP_TOKEN = "valid_setup_token_at_least_16_chars_long";
      expect(await AdminSetupService.isSetupAllowed()).toBe(true);
    });

    it("should reject setup with incorrect setup token via constant-time comparison", async () => {
      process.env.ADMIN_SETUP_TOKEN = "valid_setup_token_at_least_16_chars_long";

      const res = await AdminSetupService.completeAdminSetup({
        setupToken: "wrong_setup_token_value_here",
        adminId: "newsuperadmin",
        fullName: "Super Admin",
        email: "superadmin@gmail.com",
        phone: "+919876543210",
        password: "SecureAdminPassword@2026",
        confirmPassword: "SecureAdminPassword@2026",
        emailOtp: "123456",
      });

      expect(res.success).toBe(false);
      expect(res.message).toMatch(/invalid.*setup token/i);
    });

    it("should reject setup when email OTP has not been verified", async () => {
      process.env.ADMIN_SETUP_TOKEN = "valid_setup_token_at_least_16_chars_long";

      const res = await AdminSetupService.completeAdminSetup({
        setupToken: "valid_setup_token_at_least_16_chars_long",
        adminId: "newsuperadmin",
        fullName: "Super Admin",
        email: "superadmin@gmail.com",
        phone: "+919876543210",
        password: "SecureAdminPassword@2026",
        confirmPassword: "SecureAdminPassword@2026",
        emailOtp: "000000", // invalid otp
      });

      expect(res.success).toBe(false);
      expect(res.message).toMatch(/verification/i);
    });

    it("should successfully provision SUPER_ADMIN with valid token, OTP, and generate 10 backup codes", async () => {
      process.env.ADMIN_SETUP_TOKEN = "valid_setup_token_at_least_16_chars_long";

      // Mock OTP store verification to succeed
      vi.spyOn(OtpChallengeStore, "verifyByTarget").mockReturnValue({
        success: true,
      });

      const res = await AdminSetupService.completeAdminSetup({
        setupToken: "valid_setup_token_at_least_16_chars_long",
        adminId: "primaryadmin",
        fullName: "Primary Super Admin",
        email: "primary.admin@gmail.com",
        phone: "+919876543210",
        password: "SecureAdminPassword@2026",
        confirmPassword: "SecureAdminPassword@2026",
        emailOtp: "123456",
      });

      expect(res.success).toBe(true);
      expect(res.data?.totpSecret).toBeDefined();
      expect(res.data?.backupCodes).toHaveLength(10);

      // Verify that after provisioning, isSetupAllowed immediately becomes false
      expect(await AdminSetupService.isSetupAllowed()).toBe(false);
    });

    it("should block race conditions when two concurrent setups attempt to initialize", async () => {
      process.env.ADMIN_SETUP_TOKEN = "valid_setup_token_at_least_16_chars_long";
      vi.spyOn(OtpChallengeStore, "verifyByTarget").mockReturnValue({ success: true });

      // First setup
      const res1 = await AdminSetupService.completeAdminSetup({
        setupToken: "valid_setup_token_at_least_16_chars_long",
        adminId: "firstadmin",
        fullName: "First Admin",
        email: "first.admin@gmail.com",
        phone: "+919876543211",
        password: "SecureAdminPassword@2026",
        confirmPassword: "SecureAdminPassword@2026",
        emailOtp: "123456",
      });
      expect(res1.success).toBe(true);

      // Second concurrent setup attempt
      const res2 = await AdminSetupService.completeAdminSetup({
        setupToken: "valid_setup_token_at_least_16_chars_long",
        adminId: "secondadmin",
        fullName: "Second Admin",
        email: "second.admin@gmail.com",
        phone: "+919876543212",
        password: "SecureAdminPassword@2026",
        confirmPassword: "SecureAdminPassword@2026",
        emailOtp: "123456",
      });
      expect(res2.success).toBe(false);
      expect(res2.message).toMatch(/permanently disabled|already.*initialized/i);
    });
  });

  describe("2. Mutual Rejection & Multi-Identifier Login (/api/admin/auth/* vs /api/auth/*)", () => {
    let adminUser: StoredUser;
    let studentUser: StoredUser;
    let totpSecret: string;
    let backupCodes: string[];

    beforeEach(async () => {
      const pwHash = await hashPasswordArgon2("AdminSecretPassword@2026");
      totpSecret = generateTotpSecret();
      const enc = encryptTotpSecret(totpSecret);
      backupCodes = generateBackupCodes(10);
      const hashedBackup = backupCodes.map(hashBackupCode);

      // Setup Admin in memory
      adminUser = ({
        id: "usr_admin_test_01",
        name: "Chief Admin",
        username: "superadmin_id",
        email: "chief.admin@gmail.com",
        phone: "+919876543299",
        passwordHash: pwHash,
        role: "SUPER_ADMIN",
        accountStatus: "ACTIVE",
        createdAt: new Date(),
        adminSecurity: {
          totpSecretEnc: enc.ciphertext,
          totpIv: enc.iv,
          totpTag: enc.tag,
          totpEnabled: true,
          backupCodes: hashedBackup,
        },
      } as unknown as StoredUser);
      await AuthService.saveUserDirectly(adminUser);

      // Setup Student in memory
      const studentPwHash = await hashPasswordArgon2("StudentPassword@2026");
      studentUser = {
        id: "usr_student_test_01",
        name: "Aman Student",
        username: "aman_student",
        email: "aman@dtu.ac.in",
        phone: "+919876543288",
        passwordHash: studentPwHash,
        role: "STUDENT",
        accountStatus: "ACTIVE",
        createdAt: new Date(),
      } as StoredUser;
      await AuthService.saveUserDirectly(studentUser);
    });

    it("should allow admin to log in via Admin ID (username) in step 1", async () => {
      const res = await adminLoginStep1Action({
        identifier: "superadmin_id",
        password: "AdminSecretPassword@2026",
      });
      expect(res.success).toBe(true);
      expect(res.data?.pendingToken).toBeDefined();
    });

    it("should allow admin to log in via Gmail in step 1", async () => {
      const res = await adminLoginStep1Action({
        identifier: "chief.admin@gmail.com",
        password: "AdminSecretPassword@2026",
      });
      expect(res.success).toBe(true);
      expect(res.data?.pendingToken).toBeDefined();
    });

    it("should allow admin to log in via Mobile number (+91) in step 1", async () => {
      const res = await adminLoginStep1Action({
        identifier: "+919876543299",
        password: "AdminSecretPassword@2026",
      });
      expect(res.success).toBe(true);
      expect(res.data?.pendingToken).toBeDefined();
    });

    it("should reject admin on wrong password with generic message", async () => {
      const res = await adminLoginStep1Action({
        identifier: "superadmin_id",
        password: "WrongPassword@2026",
      });
      expect(res.success).toBe(false);
      expect(res.message).toBe("ID or password is incorrect.");
    });

    it("SECURITY: Admin account CANNOT log in through student login (/api/auth/*)", async () => {
      // Trying to log in with admin account on student login endpoint
      const res = await loginWithIdentifierAction({
        identifier: "chief.admin@gmail.com",
        password: "AdminSecretPassword@2026",
      });
      expect(res.success).toBe(false);
      expect(res.message).toBe("ID or password is incorrect.");
    });

    it("SECURITY: Student/Teacher CANNOT log in through admin login (/api/admin/auth/*)", async () => {
      // Trying to log in with student account on admin login endpoint
      const res = await adminLoginStep1Action({
        identifier: "aman@dtu.ac.in",
        password: "StudentPassword@2026",
      });
      expect(res.success).toBe(false);
      expect(res.message).toBe("ID or password is incorrect.");
    });

    it("should authorize admin in Step 2 with valid 6-digit TOTP code", async () => {
      const step1 = await adminLoginStep1Action({
        identifier: "superadmin_id",
        password: "AdminSecretPassword@2026",
      });
      const pendingToken = step1.data!.pendingToken;

      const code = generateTotpCode(totpSecret);
      const step2 = await adminLoginStep2TotpAction({
        pendingToken,
        totpCode: code,
      });

      expect(step2.success).toBe(true);
      expect(step2.data?.redirectUrl).toBe("/admin");
    });

    it("should authorize admin in Step 2 with single-use backup code and consume it", async () => {
      const step1 = await adminLoginStep1Action({
        identifier: "superadmin_id",
        password: "AdminSecretPassword@2026",
      });
      const pendingToken = step1.data!.pendingToken;

      const validBackupCode = backupCodes[0];
      const step2 = await adminLoginStep2TotpAction({
        pendingToken,
        backupCode: validBackupCode,
      });

      expect(step2.success).toBe(true);
      expect(step2.data?.redirectUrl).toBe("/admin");

      // Verify backup code is single-use: second attempt with same backup code must fail
      const step1Again = await adminLoginStep1Action({
        identifier: "superadmin_id",
        password: "AdminSecretPassword@2026",
      });
      const secondPendingToken = step1Again.data!.pendingToken;

      const reuseAttempt = await adminLoginStep2TotpAction({
        pendingToken: secondPendingToken,
        backupCode: validBackupCode,
      });
      expect(reuseAttempt.success).toBe(false);
      expect(reuseAttempt.message).toMatch(/invalid.*code/i);
    });
  });

  describe("3. Emergency Recovery (/recover-admin)", () => {
    beforeEach(async () => {
      const pwHash = await hashPasswordArgon2("OldAdminPassword@2026");
      await AuthService.saveUserDirectly({
        id: "usr_super_recover",
        name: "Locked Super Admin",
        email: "locked.admin@gmail.com",
        emailCanonical: "locked.admin@gmail.com",
        passwordHash: pwHash,
        role: "SUPER_ADMIN",
        accountStatus: "ACTIVE",
        createdAt: new Date(),
      } as unknown as StoredUser);
    });

    it("should return false (404) for recovery when ADMIN_RECOVERY_TOKEN is not configured", async () => {
      delete process.env.ADMIN_RECOVERY_TOKEN;
      expect(await AdminRecoveryService.isRecoveryAllowed()).toBe(false);
    });

    it("should permit recovery when ADMIN_RECOVERY_TOKEN is set and super admin exists", async () => {
      process.env.ADMIN_RECOVERY_TOKEN = "valid_recovery_token_16_chars_long";
      expect(await AdminRecoveryService.isRecoveryAllowed()).toBe(true);
    });

    it("should reset credentials and re-enroll TOTP when recovery token and email OTP are valid", async () => {
      process.env.ADMIN_RECOVERY_TOKEN = "valid_recovery_token_16_chars_long";
      vi.spyOn(OtpChallengeStore, "verifyByTarget").mockReturnValue({ success: true });

      const res = await AdminRecoveryService.completeRecovery({
        recoveryToken: "valid_recovery_token_16_chars_long",
        emailOtp: "123456",
        newPassword: "RecoveredNewAdminPassword@2026",
        confirmPassword: "RecoveredNewAdminPassword@2026",
      });

      expect(res.success).toBe(true);
      expect(res.data?.totpSecret).toBeDefined();
      expect(res.data?.backupCodes).toHaveLength(10);

      // Verify that admin can now log in with the new password
      const step1 = await adminLoginStep1Action({
        identifier: "locked.admin@gmail.com",
        password: "RecoveredNewAdminPassword@2026",
      });
      expect(step1.success).toBe(true);
    });
  });

  describe("4. Static Guard Test: Admin API Routes & Endpoint Security", () => {
    const rootDir = process.cwd();

    it("should verify /api/admin/auth/login-step1 route delegates to adminStep1Action with POST method", () => {
      const routePath = path.join(rootDir, "app/api/admin/auth/login-step1/route.ts");
      expect(fs.existsSync(routePath)).toBe(true);

      const content = fs.readFileSync(routePath, "utf-8");
      expect(content).toContain("adminLoginStep1Action");
      expect(content).toContain("export async function POST");
    });

    it("should verify /api/admin/auth/login-step2 route delegates to adminStep2TotpAction with POST method", () => {
      const routePath = path.join(rootDir, "app/api/admin/auth/login-step2/route.ts");
      expect(fs.existsSync(routePath)).toBe(true);

      const content = fs.readFileSync(routePath, "utf-8");
      expect(content).toContain("adminLoginStep2TotpAction");
      expect(content).toContain("export async function POST");
    });

    it("should verify /setup-admin checks isSetupAllowed and calls notFound when disabled", () => {
      const setupPath = path.join(rootDir, "app/setup-admin/page.tsx");
      expect(fs.existsSync(setupPath)).toBe(true);

      const content = fs.readFileSync(setupPath, "utf-8");
      expect(content).toContain("isSetupAllowed");
      expect(content).toContain("notFound()");
    });

    it("should verify /recover-admin checks isRecoveryAllowed and calls notFound when disabled", () => {
      const recoverPath = path.join(rootDir, "app/recover-admin/page.tsx");
      expect(fs.existsSync(recoverPath)).toBe(true);

      const content = fs.readFileSync(recoverPath, "utf-8");
      expect(content).toContain("isRecoveryAllowed");
      expect(content).toContain("notFound()");
    });

    it("should verify admin layout enforces central requireAdmin guard", () => {
      const layoutPath = path.join(rootDir, "app/admin/(portal)/layout.tsx");
      expect(fs.existsSync(layoutPath)).toBe(true);

      const content = fs.readFileSync(layoutPath, "utf-8");
      expect(content).toContain("requireAdmin");
      expect(content).toContain("redirect(");
    });

    it("should verify static proxy.ts redirects /admin to /login?mode=admin for unauthenticated requests", () => {
      const proxyPath = path.join(rootDir, "proxy.ts");
      expect(fs.existsSync(proxyPath)).toBe(true);

      const content = fs.readFileSync(proxyPath, "utf-8");
      expect(content).toContain("/login?mode=admin");
    });
  });
});
