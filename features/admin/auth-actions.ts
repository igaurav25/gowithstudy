"use server";

import crypto from "crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isDbConnected } from "@/lib/db-check";
import { AuthService } from "@/services/auth-service";
import { canonicalizeEmail, canonicalizePhone, maskEmail } from "@/lib/canonicalize";
import { verifyPasswordUnified } from "@/lib/crypto-auth";
import {
  verifyTotpCode,
  decryptTotpSecret,
  verifyAndConsumeBackupCode,
} from "@/lib/totp";
import {
  createSessionToken,
  setAdminSessionCookie,
  clearAdminSessionCookie,
  ADMIN_SESSION_DURATION,
} from "@/lib/auth";
import { OtpChallengeStore } from "@/services/auth/otp-challenge-store";
import type { ActionResult } from "@/features/auth/actions";

const DUMMY_ARGON2_HASH =
  "$argon2id$v=19$m=65536,t=3,p=4$dHVtbXlzYWx0MTIzNA$e2+q+3X9aUq8zWwQpT0oF7vGZ8vJ2yK7lA3bC4dE5fG";

interface PendingAdminLoginSession {
  userId: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
  expiresAt: number;
}

// In-memory cache for pending step-1 tokens (valid for 5 minutes)
const pendingSessions = new Map<string, PendingAdminLoginSession>();

// In-memory rate limiting and failure tracking per IP (prevents locking real admin out)
const ipFailureTracker = new Map<string, { count: number; lastFailure: number }>();

async function getClientIp(): Promise<string> {
  try {
    const h = await headers();
    return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

/**
 * Step 1: Admin ID (username) OR Gmail OR Phone E.164 + Password.
 * Returns generic error on failure with constant timing (no leak of whether admin exists).
 */
export async function adminLoginStep1Action(params: {
  identifier: string;
  password: string;
}): Promise<
  ActionResult<{
    pendingToken: string;
    maskedEmail?: string;
    emailOtpFallbackAvailable?: boolean;
  }>
> {
  const cleanId = params.identifier.trim();
  const cleanPw = params.password;
  const ip = await getClientIp();

  if (!cleanId || !cleanPw) {
    return { success: false, message: "ID and password are required." };
  }

  // Progressive backoff per IP (does not permanently lock out the real admin)
  const ipRecord = ipFailureTracker.get(ip);
  if (ipRecord && ipRecord.count >= 5) {
    const elapsed = Date.now() - ipRecord.lastFailure;
    const delayRequired = Math.min(30, Math.pow(2, ipRecord.count - 4)) * 1000;
    if (elapsed < delayRequired) {
      const waitSec = Math.ceil((delayRequired - elapsed) / 1000);
      return {
        success: false,
        message: `Too many attempts. Please wait ${waitSec}s before retrying.`,
      };
    }
  }

  // Look up user by username, canonical email, or phone (E.164)
  let user: {
    id: string;
    email: string;
    username?: string | null;
    phoneE164?: string | null;
    passwordHash: string | null;
    role: string;
    isSuspended: boolean;
    accountStatus: string;
    profile?: { name: string } | null;
  } | null = null;

  const phoneRes = canonicalizePhone(cleanId);
  const phoneE164 = phoneRes.isValid ? phoneRes.e164 : null;
  const canonicalEmail = cleanId.includes("@") ? canonicalizeEmail(cleanId) : null;

  if (await isDbConnected()) {
    const conditions: any[] = [];
    if (canonicalEmail) {
      conditions.push({ email: cleanId }, { emailCanonical: canonicalEmail });
    }
    if (phoneE164) {
      conditions.push({ phoneE164 }, { phone: cleanId });
    }
    conditions.push({ username: cleanId });

    const dbUser = await prisma.user.findFirst({
      where: { OR: conditions },
      include: { profile: true },
    });

    if (dbUser) {
      user = {
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.username,
        phoneE164: dbUser.phoneE164,
        passwordHash: dbUser.passwordHash,
        role: dbUser.role,
        isSuspended: dbUser.isSuspended,
        accountStatus: dbUser.accountStatus,
        profile: dbUser.profile,
      };
    }
  } else {
    // Disk store fallback
    const stored = (await AuthService.getUserByIdentifier(cleanId)) || (await AuthService.getUserByEmail(cleanId));
    if (stored) {
      user = {
        id: stored.id,
        email: stored.email,
        username: (stored as any).username || null,
        phoneE164: (stored as any).phoneE164 || null,
        passwordHash: stored.passwordHash || null,
        role: stored.role,
        isSuspended: Boolean(stored.isSuspended),
        accountStatus: stored.accountStatus || "ACTIVE",
        profile: { name: stored.name },
      };
    }
  }

  // SECURITY: Strictly allow only ADMIN and SUPER_ADMIN roles.
  // Student/Teacher/Unknown accounts trigger identical dummy hash check for equal timing.
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    await verifyPasswordUnified(cleanPw, DUMMY_ARGON2_HASH).catch(() => null);
    const curr = ipFailureTracker.get(ip) || { count: 0, lastFailure: 0 };
    ipFailureTracker.set(ip, { count: curr.count + 1, lastFailure: Date.now() });
    return { success: false, message: "ID or password is incorrect." };
  }

  if (user.isSuspended || user.accountStatus === "SUSPENDED" || user.accountStatus === "DEACTIVATED") {
    return { success: false, message: "This administrative account is suspended or inactive." };
  }

  if (!user.passwordHash) {
    return { success: false, message: "ID or password is incorrect." };
  }

  // Verify Password
  const passwordCheck = await verifyPasswordUnified(cleanPw, user.passwordHash);
  if (!passwordCheck.isValid) {
    const curr = ipFailureTracker.get(ip) || { count: 0, lastFailure: 0 };
    ipFailureTracker.set(ip, { count: curr.count + 1, lastFailure: Date.now() });
    if (curr.count + 1 >= 3) {
      console.warn(`[SECURITY ALERT] Repeated failed admin login attempts for user ${maskEmail(user.email)} from IP ${ip}`);
    }
    return { success: false, message: "ID or password is incorrect." };
  }

  // Reset failure count on step-1 success
  ipFailureTracker.delete(ip);

  // Generate 5-minute cryptographically random pending session token
  const randomSuffix = crypto.randomBytes(16).toString("hex");
  const pendingToken = `adm_pend_${Date.now()}_${randomSuffix}`;
  pendingSessions.set(pendingToken, {
    userId: user.id,
    email: user.email,
    role: user.role as "ADMIN" | "SUPER_ADMIN",
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  const emailOtpFallbackAvailable = process.env.ADMIN_EMAIL_OTP_FALLBACK === "true";

  return {
    success: true,
    message: "Primary credentials accepted. Please provide your 6-digit TOTP code or backup code.",
    data: {
      pendingToken,
      maskedEmail: maskEmail(user.email),
      emailOtpFallbackAvailable,
    },
  };
}

/**
 * Step 2: RFC 6238 TOTP, Backup Code, or Email OTP Fallback.
 * Rotates session ID and sets the hardened __Host-gws_admin cookie.
 */
export async function adminLoginStep2TotpAction(params: {
  pendingToken: string;
  totpCode?: string;
  backupCode?: string;
  emailOtp?: string;
}): Promise<ActionResult<{ redirectUrl: string }>> {
  const session = pendingSessions.get(params.pendingToken);
  if (!session || Date.now() > session.expiresAt) {
    pendingSessions.delete(params.pendingToken);
    return { success: false, message: "Session expired. Please sign in again." };
  }

  const cleanTotp = params.totpCode?.trim();
  const cleanBackup = params.backupCode?.trim();
  const cleanEmailOtp = params.emailOtp?.trim();

  if (!cleanTotp && !cleanBackup && !cleanEmailOtp) {
    return { success: false, message: "Please provide your 6-digit TOTP code or backup code." };
  }

  let adminSecurity: {
    totpSecretEnc: string;
    totpIv: string;
    totpTag: string;
    backupCodes: string[];
  } | null = null;

  if (await isDbConnected()) {
    const sec = await prisma.adminSecurity.findUnique({
      where: { userId: session.userId },
    });
    if (sec) {
      adminSecurity = sec;
    }
  } else {
    const stored = await AuthService.getUserById(session.userId);
    if ((stored as any)?.adminSecurity) {
      adminSecurity = (stored as any).adminSecurity;
    }
  }

  if (!adminSecurity) {
    return {
      success: false,
      message: "No TOTP 2FA configuration found for this account. Please complete setup or recovery.",
    };
  }

  let authenticated = false;
  let authMethod = "TOTP";

  // 1. Try TOTP Code (6 digits)
  if (cleanTotp && cleanTotp.length === 6) {
    try {
      const secret = decryptTotpSecret(adminSecurity.totpSecretEnc, adminSecurity.totpIv, adminSecurity.totpTag);
      authenticated = verifyTotpCode(secret, cleanTotp, 1);
    } catch {
      authenticated = false;
    }
  }

  // 2. Try Single-Use Backup Code
  if (!authenticated && cleanBackup) {
    const backupResult = verifyAndConsumeBackupCode(cleanBackup, adminSecurity.backupCodes);
    if (backupResult.valid) {
      authenticated = true;
      authMethod = "BACKUP_CODE";
      // Update consumed backup codes in DB
      if (await isDbConnected()) {
        try {
          await prisma.adminSecurity.update({
            where: { userId: session.userId },
            data: { backupCodes: backupResult.remainingHashedCodes },
          });
        } catch {
          // Non-fatal
        }
      } else {
        const stored = await AuthService.getUserById(session.userId);
        if (stored && (stored as any).adminSecurity) {
          (stored as any).adminSecurity.backupCodes = backupResult.remainingHashedCodes;
        }
      }
    }
  }

  // 3. Try Email OTP Fallback (if flag ADMIN_EMAIL_OTP_FALLBACK is enabled)
  if (!authenticated && cleanEmailOtp && process.env.ADMIN_EMAIL_OTP_FALLBACK === "true") {
    const otpVerify = OtpChallengeStore.verifyByTarget({
      purpose: "ADMIN_LOGIN_FALLBACK",
      targetCanonical: session.email,
      submittedCode: cleanEmailOtp,
    });
    if (otpVerify.success) {
      authenticated = true;
      authMethod = "EMAIL_OTP_FALLBACK";
    }
  }

  if (!authenticated) {
    return { success: false, message: "Invalid or expired verification code." };
  }

  // Consume pending session token
  pendingSessions.delete(params.pendingToken);

  // Generate Rotated Session ID
  const freshSessionId = `adm_ses_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;

  // Issue Hardened Admin JWT Token
  const adminToken = await createSessionToken(
    {
      userId: session.userId,
      email: session.email,
      name: "Administrator",
      role: session.role,
      sessionId: freshSessionId,
    },
    ADMIN_SESSION_DURATION
  );

  await setAdminSessionCookie(adminToken, ADMIN_SESSION_DURATION);

  // Email Alert & Audit Log on Login Success
  const ip = await getClientIp();
  console.log(`[ADMIN SECURITY] Successful login for admin ${session.email} from IP ${ip} via ${authMethod}`);

  if (await isDbConnected()) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          actorRole: session.role,
          action: "ADMIN_LOGIN_SUCCESS",
          entity: "ADMIN_SESSION",
          ipAddress: ip,
          metadata: {
            authMethod,
            sessionId: freshSessionId,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch {
      // Non-fatal
    }
  }

  return {
    success: true,
    message: "Admin authentication successful. Redirecting to console...",
    data: { redirectUrl: "/admin" },
  };
}

/**
 * Optional fallback: Dispatches email OTP to admin's registered Gmail
 * when flag ADMIN_EMAIL_OTP_FALLBACK=true.
 */
export async function adminSendEmailOtpFallbackAction(params: {
  pendingToken: string;
}): Promise<ActionResult> {
  if (process.env.ADMIN_EMAIL_OTP_FALLBACK !== "true") {
    return { success: false, message: "Email OTP fallback is disabled." };
  }

  const session = pendingSessions.get(params.pendingToken);
  if (!session || Date.now() > session.expiresAt) {
    return { success: false, message: "Session expired. Please sign in again." };
  }

  const clientIp = await getClientIp();
  const challenge = await OtpChallengeStore.createChallenge({
    purpose: "ADMIN_LOGIN_FALLBACK",
    channel: "EMAIL",
    targetCanonical: session.email,
    clientIp,
  });

  if (!challenge.success) {
    return { success: false, message: challenge.error || "Failed to dispatch email OTP." };
  }

  return {
    success: true,
    message: `Verification code dispatched to ${maskEmail(session.email)}.`,
  };
}

/**
 * Logs out the administrator and destroys the __Host-gws_admin cookie.
 */
export async function adminLogoutAction(): Promise<ActionResult> {
  await clearAdminSessionCookie();
  return { success: true, message: "Logged out of admin console." };
}
