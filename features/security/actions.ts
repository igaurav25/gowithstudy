"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import {
  SecurityService,
  UserSessionItem,
  SecurityAuditLogItem,
} from "@/services/security-service";

export interface SecurityActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Fetch all active sessions for current user
 */
export async function getActiveSessionsAction(): Promise<SecurityActionResponse<UserSessionItem[]>> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const sessions = await SecurityService.getActiveSessions(session.userId);
    return { success: true, data: sessions };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to load active sessions" };
  }
}

/**
 * Revoke a single remote session
 */
export async function revokeSessionAction(
  sessionId: string
): Promise<SecurityActionResponse<{ revokedSessionId: string }>> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    await SecurityService.revokeSession(session.userId, sessionId);
    revalidatePath("/dashboard/profile");
    return {
      success: true,
      message: "Device session successfully revoked.",
      data: { revokedSessionId: sessionId },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to revoke session" };
  }
}

/**
 * Terminate all sessions except the current active session
 */
export async function revokeAllOtherSessionsAction(): Promise<SecurityActionResponse<{ count: number }>> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const count = await SecurityService.revokeAllOtherSessions(session.userId);
    revalidatePath("/dashboard/profile");
    return {
      success: true,
      message: `Successfully logged out of ${count} other device(s).`,
      data: { count },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to terminate other sessions" };
  }
}

/**
 * Fetch user security audit logs
 */
export async function getSecurityAuditLogsAction(): Promise<
  SecurityActionResponse<SecurityAuditLogItem[]>
> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const logs = await SecurityService.getSecurityAuditLogs(session.userId);
    return { success: true, data: logs };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to load audit logs" };
  }
}
