"use server";

import { headers } from "next/headers";
import { AdminSetupService, AdminSetupInput } from "@/services/admin/admin-setup-service";
import { AdminRecoveryService, AdminRecoveryInput } from "@/services/admin/admin-recovery-service";
import type { ActionResult } from "@/features/auth/actions";

async function getClientIp(): Promise<string> {
  try {
    const h = await headers();
    return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

/**
 * Dispatches verification OTP to admin Gmail during setup.
 */
export async function sendAdminSetupOtpAction(
  email: string
): Promise<ActionResult<{ challengeId?: string; previewCode?: string }>> {
  const ip = await getClientIp();
  const res = await AdminSetupService.sendSetupEmailOtp(email, ip);
  if (!res.success) {
    return { success: false, message: res.message };
  }
  return {
    success: true,
    message: res.message,
    data: { challengeId: res.challengeId, previewCode: (res as any).previewCode },
  };
}

/**
 * Executes first-time Super Admin provisioning.
 */
export async function completeAdminSetupAction(
  input: AdminSetupInput
): Promise<ActionResult<{
  userId: string;
  email: string;
  totpSecret: string;
  totpUri: string;
  backupCodes: string[];
}>> {
  const ip = await getClientIp();
  const res = await AdminSetupService.completeAdminSetup(input, ip);
  if (!res.success || !res.data) {
    return { success: false, message: res.message };
  }
  return {
    success: true,
    message: res.message,
    data: res.data,
  };
}

/**
 * Verifies initial TOTP enrollment on /setup-admin.
 */
export async function verifyInitialTotpCodeAction(
  secret: string,
  code: string
): Promise<ActionResult> {
  const valid = AdminSetupService.verifyFirstTotpCode(secret, code);
  if (!valid) {
    return { success: false, message: "Invalid 6-digit TOTP code. Check your authenticator app time sync." };
  }
  return { success: true, message: "Authenticator successfully verified!" };
}

/**
 * Dispatches recovery email OTP to the registered Super Admin.
 */
export async function sendAdminRecoveryOtpAction(): Promise<
  ActionResult<{ challengeId?: string; maskedEmail?: string }>
> {
  const ip = await getClientIp();
  const res = await AdminRecoveryService.sendRecoveryEmailOtp(ip);
  if (!res.success) {
    return { success: false, message: res.message };
  }
  return {
    success: true,
    message: res.message,
    data: { challengeId: res.challengeId, maskedEmail: res.maskedEmail },
  };
}

/**
 * Completes Super Admin credential recovery.
 */
export async function completeAdminRecoveryAction(
  input: AdminRecoveryInput
): Promise<ActionResult<{
  totpSecret: string;
  totpUri: string;
  backupCodes: string[];
}>> {
  const ip = await getClientIp();
  const res = await AdminRecoveryService.completeRecovery(input, ip);
  if (!res.success || !res.data) {
    return { success: false, message: res.message };
  }
  return {
    success: true,
    message: res.message,
    data: res.data,
  };
}
