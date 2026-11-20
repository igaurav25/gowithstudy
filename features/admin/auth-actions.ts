"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isDbConnected } from "@/lib/db-check";
import { AuthService } from "@/services/auth-service";
import { canonicalizeEmail } from "@/lib/canonicalize";
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
import type { ActionResult } from "@/features/auth/actions";

interface PendingAdminLoginSession {
  userId: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
  expiresAt: number;
}

// In-memory cache for pending step-1 tokens (valid for 5 minutes)
const pendingSessions = new Map<string, PendingAdminLoginSession>();

async function getClientIp(): Promise<string> {
  try {
    const h = await headers();
    return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

/**
 * Step 1: Admin ID & Password Authentication.
 * Validates credentials and returns a pending challenge token requiring TOTP 2FA.
 */
export async function adminLoginStep1Action(params: {
  identifier: string;
  password: string;
}): Promise<ActionResult<{ pendingToken: string }>> {
  const cleanId = params.identifier.trim();
  const cleanPw = params.password;

  if (!cleanId || !cleanPw) {
    return { success: false, message: "Please provide both admin identifier and password." };
  }

  const canonical = canonicalizeEmail(cleanId);
  let user: {
    id: string;
    email: string;
    passwordHash: string | null;
    role: string;
    isSuspended: boolean;
    accountStatus: string;
  } | null = null;

  if (await isDbConnected()) {
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanId }, { emailCanonical: canonical }],
      },
    });
    if (dbUser) {
      user = {
        id: dbUser.id,
        email: dbUser.email,
        passwordHash: dbUser.passwordHash,
        role: dbUser.role,
        isSuspended: dbUser.isSuspended,
        accountStatus: dbUser.accountStatus,
      };
    }
  } else {
    const stored = (await AuthService.getUserByIdentifier(cleanId)) || (await AuthService.getUserByEmail(cleanId));
    if (stored) {
      user = {
        id: stored.id,
        email: stored.email,
        passwordHash: stored.passwordHash || null,
        role: stored.role,
        isSuspended: Boolean(stored.isSuspended),
        accountStatus: stored.accountStatus || "ACTIVE",
      };
    }
  }

  if (!user || !user.passwordHash) {
    return { success: false, message: "Invalid administrative credentials." };
  }

  // Ensure user has administrative privileges
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    return { success: false, message: "Access restricted: Administrative privileges required." };
  }

  if (user.isSuspended || user.accountStatus === "SUSPENDED") {
    return { success: false, message: "This administrative account is suspended." };
  }

  // Verify Password
  const isMatch = await verifyPasswordUnified(cleanPw, user.passwordHash);
  if (!isMatch) {
    return { success: false, message: "Invalid administrative credentials." };
  }

  // Create 5-minute pending session token
  const pendingToken = `adm_pend_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  pendingSessions.set(pendingToken, {
    userId: user.id,
    email: user.email,
    role: user.role as "ADMIN" | "SUPER_ADMIN",
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  return {
    success: true,
    message: "Primary credentials accepted. Please provide your 6-digit TOTP code.",
    data: { pendingToken },
  };
}

/**
 * Step 2: RFC 6238 TOTP or Backup Code Verification.
 * Upon successful verification, sets the hardened __Host-gws_admin cookie.
 */
export async function adminLoginStep2TotpAction(params: {
  pendingToken: string;
  totpCode?: string;
  backupCode?: string;
}): Promise<ActionResult<{ redirectUrl: string }>> {
  const session = pendingSessions.get(params.pendingToken);
  if (!session || Date.now() > session.expiresAt) {
    pendingSessions.delete(params.pendingToken);
    return { success: false, message: "Session expired. Please sign in again." };
  }

  const cleanTotp = params.totpCode?.trim();
  const cleanBackup = params.backupCode?.trim();

  if (!cleanTotp && !cleanBackup) {
    return { success: false, message: "Please provide either your 6-digit TOTP code or a backup code." };
  }

  let adminSecurity: {
    totpSecretEnc: string;
    totpIv: string;
    totpTag: string;
    backupCodes: string[];
    failedAttempts?: number;
    lockedUntil?: Date | null;
  } | null = null;

  if (await isDbConnected()) {
    const sec = await prisma.adminSecurity.findUnique({
      where: { userId: session.userId },
    });
    if (sec) {
      adminSecurity = sec;
    }
  } else {
    // Disk store fallback
    const stored = await AuthService.getUserById(session.userId);
    if ((stored as any)?.adminSecurity) {
      adminSecurity = (stored as any).adminSecurity;
    }
  }

  if (!adminSecurity) {
    return {
      success: false,
      message: "No TOTP 2FA configuration found for this account. Run admin:bootstrap or contact platform owner.",
    };
  }

  let authenticated = false;

  // 1. Try TOTP code
  if (cleanTotp && cleanTotp.length === 6) {
    try {
      const secret = decryptTotpSecret(adminSecurity.totpSecretEnc, adminSecurity.totpIv, adminSecurity.totpTag);
      authenticated = verifyTotpCode(secret, cleanTotp, 1);
    } catch {
      authenticated = false;
    }
  }

  // 2. Try Backup code if TOTP failed or backup code provided
  if (!authenticated && cleanBackup) {
    const backupResult = verifyAndConsumeBackupCode(cleanBackup, adminSecurity.backupCodes);
    if (backupResult.valid) {
      authenticated = true;
      // Update consumed backup codes in DB
      if (await isDbConnected()) {
        try {
          await prisma.adminSecurity.update({
            where: { userId: session.userId },
            data: { backupCodes: backupResult.remainingHashedCodes },
          });
        } catch {
          // Ignore
        }
      }
    }
  }

  if (!authenticated) {
    return { success: false, message: "Invalid or expired verification code." };
  }

  // Consume pending session
  pendingSessions.delete(params.pendingToken);

  // Issue Hardened Admin JWT Token and Set Cookie
  const adminToken = await createSessionToken(
    {
      userId: session.userId,
      email: session.email,
      name: "Administrator",
      role: session.role,
      sessionId: `adm_ses_${Date.now()}`,
    },
    ADMIN_SESSION_DURATION
  );

  await setAdminSessionCookie(adminToken, ADMIN_SESSION_DURATION);

  // Write Audit Log
  const ip = await getClientIp();
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
            method: cleanBackup ? "BACKUP_CODE" : "TOTP",
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
    message: "Authentication successful. Entering Admin Console...",
    data: { redirectUrl: "/admin" },
  };
}

/**
 * Logs out the administrator and destroys the admin cookie.
 */
export async function adminLogoutAction(): Promise<ActionResult> {
  await clearAdminSessionCookie();
  return { success: true, message: "Logged out of admin console." };
}
