/**
 * CampusFlow Security & Active Session Service
 * Manages concurrent device sessions, remote invalidation, and student security audit logs.
 */

export interface UserSessionItem {
  id: string;
  userId: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  isCurrent: boolean;
  createdAt: string;
  lastActiveAt: string;
}

export interface SecurityAuditLogItem {
  id: string;
  userId: string;
  event: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  status: "SUCCESS" | "WARNING" | "FAILURE";
  timestamp: string;
}

// In-Memory store for active sessions
const sessionsStore = new Map<string, UserSessionItem[]>();
const auditLogsStore = new Map<string, SecurityAuditLogItem[]>();

function getInitialSessions(userId: string): UserSessionItem[] {
  const now = Date.now();
  return [
    {
      id: `sess_cur_${userId}`,
      userId,
      deviceName: "Desktop PC (Current Device)",
      browser: "Chrome 134.0",
      os: "Windows 11",
      ipAddress: "103.25.14.82",
      location: "New Delhi, India (Campus Wi-Fi AP-304)",
      isCurrent: true,
      createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
      lastActiveAt: new Date().toISOString(),
    },
    {
      id: `sess_mob_${userId}`,
      userId,
      deviceName: "OnePlus 12 Mobile",
      browser: "Chrome Mobile 133",
      os: "Android 14",
      ipAddress: "152.57.18.90",
      location: "New Delhi, India (5G Mobile Data)",
      isCurrent: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      lastActiveAt: new Date(now - 1000 * 60 * 45).toISOString(),
    },
    {
      id: `sess_mac_${userId}`,
      userId,
      deviceName: "MacBook Air M2 (Campus Lab)",
      browser: "Safari 17.4",
      os: "macOS Sonoma",
      ipAddress: "103.25.14.99",
      location: "DTU Central Library Lab",
      isCurrent: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
      lastActiveAt: new Date(now - 1000 * 60 * 60 * 14).toISOString(),
    },
  ];
}

function getInitialAuditLogs(userId: string): SecurityAuditLogItem[] {
  const now = Date.now();
  return [
    {
      id: `sec_log_1_${userId}`,
      userId,
      event: "SESSION_AUTHENTICATED",
      description: "Successful password login with secure session cookie",
      ipAddress: "103.25.14.82",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/134.0",
      status: "SUCCESS",
      timestamp: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: `sec_log_2_${userId}`,
      userId,
      event: "MOBILE_LOGIN",
      description: "Mobile companion session started",
      ipAddress: "152.57.18.90",
      userAgent: "Mozilla/5.0 (Linux; Android 14; CPH2573) AppleWebKit/537.36 Chrome/133.0",
      status: "SUCCESS",
      timestamp: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: `sec_log_3_${userId}`,
      userId,
      event: "PASSWORD_VERIFICATION",
      description: "Password verification check passed for profile update",
      ipAddress: "103.25.14.82",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      status: "SUCCESS",
      timestamp: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
    },
    {
      id: `sec_log_4_${userId}`,
      userId,
      event: "RATE_LIMIT_CHECK",
      description: "Rate limiter verified clean request frequency",
      ipAddress: "103.25.14.82",
      userAgent: "CampusFlow Client",
      status: "SUCCESS",
      timestamp: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
    },
  ];
}

export class SecurityService {
  /**
   * Retrieves all active sessions for a user.
   */
  static async getActiveSessions(userId: string): Promise<UserSessionItem[]> {
    if (!sessionsStore.has(userId)) {
      sessionsStore.set(userId, getInitialSessions(userId));
    }
    return sessionsStore.get(userId) || [];
  }

  /**
   * Revoke a single active session (Remote device logout).
   */
  static async revokeSession(userId: string, sessionId: string): Promise<boolean> {
    const sessions = await this.getActiveSessions(userId);
    const updated = sessions.filter((s) => s.id !== sessionId);
    sessionsStore.set(userId, updated);

    await this.logSecurityEvent(
      userId,
      "SESSION_REVOKED",
      `Revoked session on device: ${sessionId}`,
      "127.0.0.1",
      "Internal Security Service",
      "WARNING"
    );

    return true;
  }

  /**
   * Revoke all sessions except the current active session.
   */
  static async revokeAllOtherSessions(userId: string): Promise<number> {
    const sessions = await this.getActiveSessions(userId);
    const remaining = sessions.filter((s) => s.isCurrent);
    const revokedCount = sessions.length - remaining.length;
    sessionsStore.set(userId, remaining);

    await this.logSecurityEvent(
      userId,
      "ALL_OTHER_SESSIONS_REVOKED",
      `Terminated ${revokedCount} remote sessions across other devices`,
      "127.0.0.1",
      "Internal Security Service",
      "SUCCESS"
    );

    return revokedCount;
  }

  /**
   * Fetch recent security audit logs for a student account.
   */
  static async getSecurityAuditLogs(userId: string): Promise<SecurityAuditLogItem[]> {
    if (!auditLogsStore.has(userId)) {
      auditLogsStore.set(userId, getInitialAuditLogs(userId));
    }
    return auditLogsStore.get(userId) || [];
  }

  /**
   * Logs a security audit event for transparency.
   */
  static async logSecurityEvent(
    userId: string,
    event: string,
    description: string,
    ipAddress: string = "127.0.0.1",
    userAgent: string = "CampusFlow System",
    status: "SUCCESS" | "WARNING" | "FAILURE" = "SUCCESS"
  ): Promise<void> {
    const logs = await this.getSecurityAuditLogs(userId);
    const newEntry: SecurityAuditLogItem = {
      id: `sec_log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      event,
      description,
      ipAddress,
      userAgent,
      status,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newEntry);
    auditLogsStore.set(userId, logs.slice(0, 50)); // Keep last 50 events
  }
}
