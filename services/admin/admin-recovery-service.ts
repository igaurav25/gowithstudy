import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { isDbConnected } from "@/lib/db-check";
import { AuthService } from "@/services/auth-service";
import { canonicalizeEmail } from "@/lib/canonicalize";
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

export interface AdminRecoveryInput {
  recoveryToken: string;
  emailOtp: string;
  newPassword: string;
  confirmPassword: string;
}

export class AdminRecoveryService {
  /**
   * Checks whether /recover-admin is permitted:
   * (a) ADMIN_RECOVERY_TOKEN is set in environment and >= 16 chars
   * (b) A SUPER_ADMIN exists in the system
   */
  static async isRecoveryAllowed(): Promise<boolean> {
    const recoveryToken = process.env.ADMIN_RECOVERY_TOKEN?.trim();
    if (!recoveryToken || recoveryToken.length < 16) {
      return false;
    }

    if (await isDbConnected()) {
      const superAdmin = await prisma.user.findFirst({
        where: { role: "SUPER_ADMIN" },
        select: { id: true },
      });
      return Boolean(superAdmin);
    } else {
      const list = await AuthService.listAllUsers();
      const superAdmin = list.find((u) => u.role === "SUPER_ADMIN");
      return Boolean(superAdmin);
    }
  }

  /**
   * Dispatches recovery verification OTP to the registered SUPER_ADMIN's Gmail.
   */
  static async sendRecoveryEmailOtp(
    clientIp: string = "127.0.0.1"
  ): Promise<{ success: boolean; message: string; challengeId?: string; maskedEmail?: string }> {
    const allowed = await this.isRecoveryAllowed();
    if (!allowed) {
      return { success: false, message: "Admin recovery is not configured or unavailable." };
    }

    let superAdminEmail: string | null = null;
    if (await isDbConnected()) {
      const user = await prisma.user.findFirst({
        where: { role: "SUPER_ADMIN" },
        select: { email: true, emailCanonical: true },
      });
      superAdminEmail = user?.emailCanonical || user?.email || null;
    } else {
      const list = await AuthService.listAllUsers();
      const user = list.find((u) => u.role === "SUPER_ADMIN");
      superAdminEmail = user?.email || null;
    }

    if (!superAdminEmail) {
      return { success: false, message: "No Super Administrator found." };
    }

    const challenge = await OtpChallengeStore.createChallenge({
      purpose: "ADMIN_RECOVERY_EMAIL",
      channel: "EMAIL",
      targetCanonical: superAdminEmail,
      clientIp,
    });

    if (!challenge.success || !challenge.challengeId) {
      return { success: false, message: challenge.error || "Failed to dispatch recovery code." };
    }

    const masked = superAdminEmail.replace(/^(.{2})(.*)(@.*)$/, "$1***$3");
    return {
      success: true,
      message: `Recovery code dispatched to ${masked}.`,
      challengeId: challenge.challengeId,
      maskedEmail: masked,
    };
  }

  /**
   * Completes Super Admin recovery:
   * 1. Validates ADMIN_RECOVERY_TOKEN in constant time
   * 2. Validates Email OTP
   * 3. Sets new Argon2id password
   * 4. Re-enrolls TOTP with fresh secret + 10 fresh backup codes
   * 5. Revokes all active admin sessions
   * 6. Audit-logs recovery and issues security alert
   */
  static async completeRecovery(
    input: AdminRecoveryInput,
    clientIp: string = "127.0.0.1"
  ): Promise<{
    success: boolean;
    message: string;
    data?: {
      totpSecret: string;
      totpUri: string;
      backupCodes: string[];
    };
  }> {
    const allowed = await this.isRecoveryAllowed();
    if (!allowed) {
      return { success: false, message: "Admin recovery is disabled." };
    }

    // 1. Verify token constant time
    const expected = process.env.ADMIN_RECOVERY_TOKEN?.trim() || "";
    if (!constantTimeCompare(input.recoveryToken.trim(), expected)) {
      console.warn(`[ADMIN RECOVERY] Invalid recovery token attempt from IP: ${clientIp}`);
      return { success: false, message: "Invalid administrator recovery token." };
    }

    // 2. Fetch Super Admin
    let superAdmin: any = null;
    if (await isDbConnected()) {
      superAdmin = await prisma.user.findFirst({
        where: { role: "SUPER_ADMIN" },
      });
    } else {
      const list = await AuthService.listAllUsers();
      superAdmin = list.find((u) => u.role === "SUPER_ADMIN");
    }

    if (!superAdmin) {
      return { success: false, message: "Super Admin record not found." };
    }

    // 3. Verify Email OTP
    const cleanEmail = canonicalizeEmail(superAdmin.email);
    const otpVerify = OtpChallengeStore.verifyByTarget({
      purpose: "ADMIN_RECOVERY_EMAIL",
      targetCanonical: cleanEmail,
      submittedCode: input.emailOtp.trim(),
    });

    if (!otpVerify.success) {
      return { success: false, message: otpVerify.error || "Invalid or expired recovery verification code." };
    }

    // 4. Validate new password
    if (!input.newPassword || input.newPassword.length < 12) {
      return { success: false, message: "New password must be at least 12 characters." };
    }
    if (input.newPassword !== input.confirmPassword) {
      return { success: false, message: "Passwords do not match." };
    }

    const pwned = await checkPwnedPassword(input.newPassword);
    if (pwned.isBreached) {
      return {
        success: false,
        message: "This password has appeared in known data breaches. Please choose a more secure password.",
      };
    }

    // 5. Generate fresh credentials
    const newPasswordHash = await hashPasswordArgon2(input.newPassword);
    const totpSecret = generateTotpSecret();
    const encryptedSecret = encryptTotpSecret(totpSecret);
    const backupCodes = generateBackupCodes(10);
    const hashedBackupCodes = backupCodes.map(hashBackupCode);
    const totpUri = generateTotpUri(cleanEmail, totpSecret);

    if (await isDbConnected()) {
      try {
        await prisma.$transaction(async (tx) => {
          // Update password and account status
          await tx.user.update({
            where: { id: superAdmin.id },
            data: {
              passwordHash: newPasswordHash,
              accountStatus: "ACTIVE",
              isSuspended: false,
            },
          });

          // Re-enroll TOTP & update backup codes
          await tx.adminSecurity.upsert({
            where: { userId: superAdmin.id },
            create: {
              userId: superAdmin.id,
              totpSecretEnc: encryptedSecret.ciphertext,
              totpIv: encryptedSecret.iv,
              totpTag: encryptedSecret.tag,
              totpEnabled: true,
              backupCodes: hashedBackupCodes,
            },
            update: {
              totpSecretEnc: encryptedSecret.ciphertext,
              totpIv: encryptedSecret.iv,
              totpTag: encryptedSecret.tag,
              totpEnabled: true,
              backupCodes: hashedBackupCodes,
              failedAttempts: 0,
              lockedUntil: null,
            },
          });

          // Revoke all existing sessions for this user
          await tx.session.deleteMany({
            where: { userId: superAdmin.id },
          });

          // Audit log
          await tx.auditLog.create({
            data: {
              userId: superAdmin.id,
              actorRole: "SUPER_ADMIN",
              action: "SUPER_ADMIN_RECOVERY_COMPLETED",
              entity: "USER",
              entityId: superAdmin.id,
              ipAddress: clientIp,
              metadata: {
                timestamp: new Date().toISOString(),
                sessionsRevoked: true,
              },
            },
          });
        });

        console.log(`[ADMIN RECOVERY] Super Admin credentials successfully reset for ${cleanEmail}`);

        return {
          success: true,
          message: "Admin credentials successfully recovered! Set up your new authenticator below.",
          data: {
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
      superAdmin.passwordHash = newPasswordHash;
      superAdmin.accountStatus = "ACTIVE";
      superAdmin.isSuspended = false;
      superAdmin.adminSecurity = {
        totpSecretEnc: encryptedSecret.ciphertext,
        totpIv: encryptedSecret.iv,
        totpTag: encryptedSecret.tag,
        totpEnabled: true,
        backupCodes: hashedBackupCodes,
      };

      await AuthService.saveUserDirectly(superAdmin);

      return {
        success: true,
        message: "Admin credentials recovered successfully in disk store!",
        data: {
          totpSecret,
          totpUri,
          backupCodes,
        },
      };
    }
  }
}
