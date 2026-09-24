"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Shield,
  Smartphone,
  Monitor,
  Laptop,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Lock,
  Radio,
  FileCheck2,
} from "lucide-react";
import { UserSessionItem, SecurityAuditLogItem } from "@/services/security-service";
import {
  revokeSessionAction,
  revokeAllOtherSessionsAction,
  getActiveSessionsAction,
  getSecurityAuditLogsAction,
} from "@/features/security/actions";

interface SecuritySessionsManagerProps {
  initialSessions?: UserSessionItem[];
  initialAuditLogs?: SecurityAuditLogItem[];
}

export function SecuritySessionsManager({
  initialSessions = [],
  initialAuditLogs = [],
}: SecuritySessionsManagerProps) {
  const [sessions, setSessions] = useState<UserSessionItem[]>(initialSessions);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLogItem[]>(initialAuditLogs);
  const [actionMessage, setActionMessage] = useState<{ text: string; isError?: boolean } | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (initialSessions.length === 0) {
      getActiveSessionsAction().then((res) => {
        if (res.success && res.data) setSessions(res.data);
      });
    }
    if (initialAuditLogs.length === 0) {
      getSecurityAuditLogsAction().then((res) => {
        if (res.success && res.data) setAuditLogs(res.data);
      });
    }
  }, [initialSessions.length, initialAuditLogs.length]);

  const handleRevokeSession = (sessionId: string) => {
    if (!window.confirm("Are you sure you want to log out of this device?")) return;

    startTransition(async () => {
      const res = await revokeSessionAction(sessionId);
      if (res.success) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        setActionMessage({ text: res.message || "Session revoked." });
      } else {
        setActionMessage({ text: res.error || "Failed to revoke session", isError: true });
      }
      setTimeout(() => setActionMessage(null), 4000);
    });
  };

  const handleRevokeAllOtherSessions = () => {
    if (
      !window.confirm(
        "Are you sure you want to log out from all other devices? Only your current browser session will remain active."
      )
    )
      return;

    startTransition(async () => {
      const res = await revokeAllOtherSessionsAction();
      if (res.success) {
        setSessions((prev) => prev.filter((s) => s.isCurrent));
        setActionMessage({ text: res.message || "All other sessions logged out." });
      } else {
        setActionMessage({ text: res.error || "Failed to terminate other sessions", isError: true });
      }
      setTimeout(() => setActionMessage(null), 4000);
    });
  };

  const getDeviceIcon = (deviceName: string) => {
    const lower = deviceName.toLowerCase();
    if (lower.includes("mobile") || lower.includes("iphone") || lower.includes("android")) {
      return <Smartphone className="w-5 h-5" />;
    }
    if (lower.includes("macbook") || lower.includes("laptop")) {
      return <Laptop className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Security Posture Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Bcrypt Hashing
            </div>
            <div className="text-[11px] text-zinc-500">Salt Rounds = 10 (Encrypted)</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Rate Limiter
            </div>
            <div className="text-[11px] text-zinc-500">Sliding Window Protection</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Secure Cookies
            </div>
            <div className="text-[11px] text-zinc-500">HttpOnly & SameSite=Lax</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              CSP & XSS Shield
            </div>
            <div className="text-[11px] text-zinc-500">Frame-Ancestors None</div>
          </div>
        </div>
      </div>

      {/* Action Notification Message */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold border flex items-center space-x-2 animate-in fade-in ${
            actionMessage.isError
              ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          }`}
        >
          {actionMessage.isError ? (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Active Device Sessions List */}
      <div className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Active Devices & Sessions</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Manage devices currently logged into your student account.
            </p>
          </div>

          {sessions.length > 1 && (
            <button
              onClick={handleRevokeAllOtherSessions}
              disabled={isPending}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl transition disabled:opacity-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out all other devices</span>
            </button>
          )}
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start space-x-3.5">
                <div
                  className={`p-2.5 rounded-xl border mt-0.5 ${
                    sess.isCurrent
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  {getDeviceIcon(sess.deviceName)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {sess.deviceName}
                    </span>
                    {sess.isCurrent && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md">
                        This Device
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
                    <span className="font-mono">{sess.browser}</span>
                    <span>•</span>
                    <span>{sess.os}</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1 font-mono">
                      <span>IP: {sess.ipAddress}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-zinc-400" />
                      <span>{sess.location}</span>
                    </span>
                  </div>
                </div>
              </div>

              {!sess.isCurrent && (
                <button
                  onClick={() => handleRevokeSession(sess.id)}
                  disabled={isPending}
                  className="self-end sm:self-center px-3 py-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Security Audit Log */}
      <div className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-4">
        <div className="pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Recent Security Events & Audit Trail</span>
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time record of logins, password updates, and session events.
          </p>
        </div>

        <div className="space-y-2.5">
          {auditLogs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    {log.event}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                      log.status === "SUCCESS"
                        ? "text-emerald-500 bg-emerald-500/10"
                        : "text-amber-500 bg-amber-500/10"
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500">{log.description}</div>
              </div>

              <div className="text-right text-[11px] text-zinc-400 font-mono shrink-0">
                {new Date(log.timestamp).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
