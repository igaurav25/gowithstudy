import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { isDbConnected } from "@/lib/db-check";
import { AuthService } from "@/services/auth-service";
import { canonicalizeEmail, canonicalizePhone } from "@/lib/canonicalize";
import { hashPasswordArgon2 } from "@/lib/crypto-auth";
import { checkPwnedPassword } from "@/lib/pwned-password";
import { constantTimeCompare } from "@/lib/constant-time";
import {
  generateTotpSecret,
  encryptTotpSecret,
  generateTotpUri,
  generateBackupCodes,
  hashBackupCode,
  verifyTotpCode,
} from "@/lib/totp";
import { OtpChallengeStore } from "@/services/auth/otp-challenge-store";

export interface AdminSetupInput {
  setupToken: string;
  adminId: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  emailOtp: string;
}

export class AdminSetupService {
  /**
   * Checks whether the one-time /setup-admin page is permitted:
   * (a) No SUPER_ADMIN exists in the database/store
   * (b) ADMIN_SETUP_TOKEN environment variable is set and >= 16 chars
   */
  static async isSetupAllowed(): Promise<boolean> {
    const setupToken = process.env.ADMIN_SETUP_TOKEN?.trim();
    if (!setupToken || setupToken.length < 16) {
      return false;
    }

    if (await isDbConnected()) {
      const existingSuper = await prisma.user.findFirst({
        where: { role: "SUPER_ADMIN" },
        select: { id: true },
      });
      if (existingSuper) {
        return false;
      }
    } else {
      const list = await AuthService.listAllUsers();
      const existingSuper = list.find((u) => u.role === "SUPER_ADMIN");
      if (existingSuper) {
        return false;
      }
    }

    return true;
  }

  /**
   * Dispatches email OTP to the admin's Gmail address for identity verification.
   */
  static async sendSetupEmailOtp(
    email: string,
    clientIp: string
  ): Promise<{ success: boolean; message: string; challengeId?: string }> {
    const allowed = await this.isSetupAllowed();
    if (!allowed) {
      return { success: false, message: "Admin setup is unavailable." };
    }

    const cleanEmail = canonicalizeEmail(email);
    if (!cleanEmail.endsWith("@gmail.com") && !cleanEmail.includes("@")) {
      return { success: false, message: "Please provide a valid Gmail address." };
    }

    const challenge = await OtpChallengeStore.createChallenge({
      purpose: "ADMIN_SETUP_EMAIL",
      channel: "EMAIL",
      targetCanonical: cleanEmail,
      clientIp,
    });

    if (!challenge.success || !challenge.challengeId) {
      return { success: false, message: challenge.error || "Failed to send verification code." };
    }

    const previewHint = (!process.env.RESEND_API_KEY && (challenge as any).previewCode)
      ? ` (Delivery simulated: OTP is ${(challenge as any).previewCode})`
      : "";

    return {
      success: true,
      message: `Verification code dispatched to ${cleanEmail}.${previewHint}`,
      challengeId: challenge.challengeId,
      previewCode: (challenge as any).previewCode,
    };
  }

  /**
   * Executes one-time Super Admin provisioning in a single atomic transaction.
   * Enforces partial unique index idx_user_single_super_admin against concurrent races.
   */
  static async completeAdminSetup(
    input: AdminSetupInput,
    clientIp: string = "127.0.0.1"
  ): Promise<{
    success: boolean;
    message: string;
    data?: {
      userId: string;
      email: string;
      totpSecret: string;
      totpUri: string;
      backupCodes: string[];
    };
  }> {
    const allowed = await this.isSetupAllowed();
    if (!allowed) {
      return { success: false, message: "Admin setup is permanently disabled or not configured." };
    }

    // 1. Constant-time comparison of setup token
    const expectedToken = process.env.ADMIN_SETUP_TOKEN?.trim() || "";
    if (!constantTimeCompare(input.setupToken.trim(), expectedToken)) {
      // Audit log failed attempt without logging the token
      console.warn(`[ADMIN SETUP] Invalid setup token attempt from IP: ${clientIp}`);
      return { success: false, message: "Invalid administrator setup token." };
    }

    // 2. Validate email OTP
    const cleanEmail = canonicalizeEmail(input.email);
    const otpVerify = OtpChallengeStore.verifyByTarget({
      purpose: "ADMIN_SETUP_EMAIL",
      targetCanonical: cleanEmail,
      submittedCode: input.emailOtp.trim(),
    });

    if (!otpVerify.success) {
      return { success: false, message: otpVerify.error || "Invalid or expired email verification code." };
    }

    // 3. Validate passwords
    if (!input.password || input.password.length < 6) {
      return { success: false, message: "Password must be at least 6 characters." };
    }

    if (input.password !== input.confirmPassword) {
      return { success: false, message: "Passwords do not match." };
    }

    // Check breached passwords
    const pwned = await checkPwnedPassword(input.password);
    if (pwned.isBreached) {
      return {
        success: false,
        message: "This password has appeared in known data breaches. Please choose a unique, stronger password.",
      };
    }

    // 4. Validate and canonicalize phone (E.164)
    const phoneRes = canonicalizePhone(input.phone);
    if (!phoneRes.isValid) {
      return { success: false, message: phoneRes.errorMessage || "Invalid phone number." };
    }
    const phoneE164 = phoneRes.e164;

    const username = input.adminId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!username || username.length < 3) {
      return { success: false, message: "Admin ID must be at least 3 alphanumeric characters." };
    }

    // 5. Generate TOTP secret and 10 single-use backup codes
    const passwordHash = await hashPasswordArgon2(input.password);
    const totpSecret = generateTotpSecret();
    const encryptedSecret = encryptTotpSecret(totpSecret);
    const backupCodes = generateBackupCodes(10);
    const hashedBackupCodes = backupCodes.map(hashBackupCode);
    const totpUri = generateTotpUri(cleanEmail, totpSecret);

    // 6. Atomic Transaction to enforce single SUPER_ADMIN invariant
    if (await isDbConnected()) {
      try {
        const user = await prisma.$transaction(async (tx) => {
          // Double check inside transaction
          const existing = await tx.user.findFirst({
            where: { role: "SUPER_ADMIN" },
          });
          if (existing) {
            throw new Error("A Super Administrator account has already been initialized.");
          }

          const createdUser = await tx.user.create({
            data: {
              email: input.email.trim(),
              emailCanonical: cleanEmail,
              username,
              phone: input.phone.trim(),
              phoneE164,
              passwordHash,
              role: "SUPER_ADMIN",
              accountStatus: "ACTIVE",
              emailVerified: true,
              phoneVerified: true,
              isLegacy: false,
              profile: {
                create: {
                  name: input.fullName.trim(),
                  college: "GoWithStudy Central Governance",
                  course: "Administration",
                  branch: "Executive Office",
                  year: 4,
                  semester: 8,
                },
              },
              adminSecurity: {
                create: {
                  totpSecretEnc: encryptedSecret.ciphertext,
                  totpIv: encryptedSecret.iv,
                  totpTag: encryptedSecret.tag,
                  totpEnabled: true,
                  backupCodes: hashedBackupCodes,
                },
              },
            },
          });

          await tx.auditLog.create({
            data: {
              userId: createdUser.id,
              actorRole: "SUPER_ADMIN",
              action: "SUPER_ADMIN_SETUP_COMPLETED",
              entity: "USER",
              entityId: createdUser.id,
              ipAddress: clientIp,
              metadata: {
                emailCanonical: cleanEmail,
                username,
                timestamp: new Date().toISOString(),
              },
            },
          });

          return createdUser;
        });

        console.log(`[ADMIN SETUP] Super Admin account created: ${user.id} (${cleanEmail})`);

        return {
          success: true,
          message: "Super Admin account created successfully! Complete TOTP verification below.",
          data: {
            userId: user.id,
            email: cleanEmail,
            totpSecret,
            totpUri,
            backupCodes,
          },
        };
      } catch (err) {
        return { success: false, message: (err as Error).message };
      }
    } else {
      // Disk store fallback
      const createdUser = {
        id: `usr_super_${Date.now()}`,
        name: input.fullName.trim(),
        email: input.email.trim(),
        emailCanonical: cleanEmail,
        username,
        phone: input.phone.trim(),
        phoneE164,
        passwordHash,
        role: "SUPER_ADMIN" as const,
        accountStatus: "ACTIVE" as const,
        isSuspended: false,
        emailVerified: true,
        phoneVerified: true,
        isLegacy: false,
        college: "GoWithStudy Central Governance",
        course: "Administration",
        branch: "Executive Office",
        year: 4,
        semester: 8,
        createdAt: new Date(),
        adminSecurity: {
          totpSecretEnc: encryptedSecret.ciphertext,
          totpIv: encryptedSecret.iv,
          totpTag: encryptedSecret.tag,
          totpEnabled: true,
          backupCodes: hashedBackupCodes,
        },
      };

      await AuthService.saveUserDirectly(createdUser as any);

      return {
        success: true,
        message: "Super Admin account created successfully in disk store!",
        data: {
          userId: createdUser.id,
          email: cleanEmail,
          totpSecret,
          totpUri,
          backupCodes,
        },
      };
    }
  }

  /**
   * Verifies the first TOTP code to confirm the admin has enrolled their authenticator.
   */
  static verifyFirstTotpCode(secretBase32: string, code: string): boolean {
    return verifyTotpCode(secretBase32, code.trim(), 1);
  }
}
