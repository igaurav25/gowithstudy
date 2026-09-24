"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Trash2,
  Settings2,
  Calendar,
  Clock,
  Briefcase,
  Users,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Rocket,
  Search,
  ExternalLink,
  Check,
  SlidersHorizontal,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  AlertTriangle,
  Inbox,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NotificationItem,
  NotificationPreferenceItem,
  NotificationStats,
} from "@/services/notifications-service";
import {
  markAsReadAction,
  markAllAsReadAction,
  deleteNotificationAction,
  clearReadNotificationsAction,
  updateNotificationPreferencesAction,
} from "@/features/notifications/actions";

interface NotificationsCenterViewProps {
  initialNotifications: NotificationItem[];
  initialPreferences: NotificationPreferenceItem;
  initialStats: NotificationStats;
  currentUserId: string;
}

type TabType = "ALL" | "UNREAD" | "DEADLINES" | "COMMUNITY" | "SYSTEM" | "SETTINGS";

export function NotificationsCenterView({
  initialNotifications,
  initialPreferences,
  initialStats,
  currentUserId,
}: NotificationsCenterViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = React.useState<TabType>(
    requestedTab?.toLowerCase() === "settings" ? "SETTINGS" : "ALL"
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [notifications, setNotifications] =
    React.useState<NotificationItem[]>(initialNotifications);
  const [preferences, setPreferences] =
    React.useState<NotificationPreferenceItem>(initialPreferences);
  const [stats, setStats] = React.useState<NotificationStats>(initialStats);
  const [isPending, startTransition] = React.useTransition();
  const [savingPrefs, setSavingPrefs] = React.useState(false);
  const [prefSaveSuccess, setPrefSaveSuccess] = React.useState(false);

  // Sync state when props change
  React.useEffect(() => {
    setNotifications(initialNotifications);
    setPreferences(initialPreferences);
    setStats(initialStats);
  }, [initialNotifications, initialPreferences, initialStats]);

  // Recalculate stats helper
  const refreshStats = (newList: NotificationItem[]) => {
    setStats({
      total: newList.length,
      unread: newList.filter((n) => !n.read).length,
      urgentCount: newList.filter((n) => n.priority === "URGENT" || n.priority === "HIGH").length,
      deadlinesCount: newList.filter(
        (n) => n.type === "DEADLINE_WARNING" || n.type === "ASSIGNMENT_REMINDER"
      ).length,
    });
  };

  // Mark single as read/unread
  const handleToggleRead = (id: string, currentRead: boolean) => {
    const targetState = !currentRead;
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: targetState, readAt: targetState ? new Date().toISOString() : null } : n
    );
    setNotifications(updated);
    refreshStats(updated);

    startTransition(async () => {
      await markAsReadAction(id, targetState);
    });
  };

  // Mark all as read
  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({
      ...n,
      read: true,
      readAt: n.readAt || new Date().toISOString(),
    }));
    setNotifications(updated);
    refreshStats(updated);

    startTransition(async () => {
      await markAllAsReadAction();
    });
  };

  // Delete notification
  const handleDeleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    refreshStats(updated);

    startTransition(async () => {
      await deleteNotificationAction(id);
    });
  };

  // Clear all read
  const handleClearRead = () => {
    const updated = notifications.filter((n) => !n.read);
    setNotifications(updated);
    refreshStats(updated);

    startTransition(async () => {
      await clearReadNotificationsAction();
    });
  };

  // Toggle preference switch
  const handleTogglePreference = (key: keyof NotificationPreferenceItem) => {
    const updated = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(updated);

    setSavingPrefs(true);
    startTransition(async () => {
      await updateNotificationPreferencesAction(updated);
      setSavingPrefs(false);
      setPrefSaveSuccess(true);
      setTimeout(() => setPrefSaveSuccess(false), 2500);
    });
  };

  // Filtered notifications
  const filteredNotifications = React.useMemo(() => {
    return notifications.filter((n) => {
      // Tab filter
      if (activeTab === "UNREAD" && n.read) return false;
      if (
        activeTab === "DEADLINES" &&
        n.type !== "DEADLINE_WARNING" &&
        n.type !== "ASSIGNMENT_REMINDER"
      )
        return false;
      if (
        activeTab === "COMMUNITY" &&
        n.type !== "TEAM_REQUEST" &&
        n.type !== "COMMUNITY_INTERACTION"
      )
        return false;
      if (
        activeTab === "SYSTEM" &&
        n.type !== "SYSTEM_ANNOUNCEMENT" &&
        n.type !== "SECURITY_ALERT" &&
        n.type !== "MODERATION_NOTICE" &&
        n.type !== "AI_COMPLETION"
      )
        return false;

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(q);
        const matchesMessage = n.message.toLowerCase().includes(q);
        const matchesType = n.type.toLowerCase().includes(q);
        if (!matchesTitle && !matchesMessage && !matchesType) return false;
      }

      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "DEADLINE_WARNING":
        return <Clock className="w-5 h-5 text-rose-500" />;
      case "ASSIGNMENT_REMINDER":
        return <Calendar className="w-5 h-5 text-amber-500" />;
      case "TEAM_REQUEST":
        return <Rocket className="w-5 h-5 text-violet-500" />;
      case "COMMUNITY_INTERACTION":
        return <Users className="w-5 h-5 text-sky-500" />;
      case "SECURITY_ALERT":
        return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case "AI_COMPLETION":
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      case "MODERATION_NOTICE":
        return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px]">
            Urgent
          </Badge>
        );
      case "HIGH":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px]">
            High Priority
          </Badge>
        );
      case "LOW":
        return (
          <Badge className="bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 text-[10px]">
            Info
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Notification Center
            </h1>
            {stats.unread > 0 && (
              <Badge variant="purple" className="px-2.5 py-0.5 text-xs animate-pulse">
                {stats.unread} unread
              </Badge>
            )}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Stay on top of upcoming assignment deadlines, hackathon teammate applications, and security alerts.
          </p>
        </div>

        {/* Global Quick Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {stats.unread > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={isPending}
              className="text-xs gap-1.5 h-9"
            >
              <CheckCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Mark all as read</span>
            </Button>
          )}

          {notifications.some((n) => n.read) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearRead}
              disabled={isPending}
              className="text-xs gap-1.5 h-9 text-zinc-600 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear read</span>
            </Button>
          )}

          <Button
            variant={activeTab === "SETTINGS" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(activeTab === "SETTINGS" ? "ALL" : "SETTINGS")}
            className="text-xs gap-1.5 h-9"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setActiveTab("UNREAD")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "UNREAD"
              ? "border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-950/20 ring-1 ring-indigo-500/20"
              : "border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Unread Alerts
            </span>
            <div className="w-7 h-7 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black mt-2 text-zinc-900 dark:text-zinc-50">
            {stats.unread}
          </p>
          <span className="text-[11px] text-zinc-400">Requires attention</span>
        </div>

        <div
          onClick={() => setActiveTab("DEADLINES")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "DEADLINES"
              ? "border-rose-500/50 bg-rose-50/50 dark:bg-rose-950/20 ring-1 ring-rose-500/20"
              : "border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Deadlines & Tasks
            </span>
            <div className="w-7 h-7 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black mt-2 text-zinc-900 dark:text-zinc-50">
            {stats.deadlinesCount}
          </p>
          <span className="text-[11px] text-zinc-400">Submissions & warnings</span>
        </div>

        <div
          onClick={() => setActiveTab("COMMUNITY")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "COMMUNITY"
              ? "border-violet-500/50 bg-violet-50/50 dark:bg-violet-950/20 ring-1 ring-violet-500/20"
              : "border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Team & Community
            </span>
            <div className="w-7 h-7 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Rocket className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black mt-2 text-zinc-900 dark:text-zinc-50">
            {
              notifications.filter(
                (n) => n.type === "TEAM_REQUEST" || n.type === "COMMUNITY_INTERACTION"
              ).length
            }
          </p>
          <span className="text-[11px] text-zinc-400">Applications & replies</span>
        </div>

        <div
          onClick={() => setActiveTab("SYSTEM")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "SYSTEM"
              ? "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-500/20"
              : "border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              High Priority & Auth
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black mt-2 text-zinc-900 dark:text-zinc-50">
            {stats.urgentCount}
          </p>
          <span className="text-[11px] text-zinc-400">Security & notices</span>
        </div>
      </div>

      {/* Main Tabs Navigation & Search Bar */}
      {activeTab !== "SETTINGS" && (
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "ALL", label: "All Alerts", count: notifications.length },
              { id: "UNREAD", label: "Unread", count: stats.unread },
              { id: "DEADLINES", label: "Deadlines", count: stats.deadlinesCount },
              {
                id: "COMMUNITY",
                label: "Team & Forum",
                count: notifications.filter(
                  (n) => n.type === "TEAM_REQUEST" || n.type === "COMMUNITY_INTERACTION"
                ).length,
              },
              {
                id: "SYSTEM",
                label: "System & Security",
                count: notifications.filter(
                  (n) =>
                    n.type === "SYSTEM_ANNOUNCEMENT" ||
                    n.type === "SECURITY_ALERT" ||
                    n.type === "MODERATION_NOTICE" ||
                    n.type === "AI_COMPLETION"
                ).length,
              },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? "bg-white/20 dark:bg-zinc-900/30 text-white dark:text-zinc-900"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="pl-9 h-9 text-xs rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            />
          </div>
        </div>
      )}

      {/* VIEW 1: Preferences Settings Panel */}
      {activeTab === "SETTINGS" ? (
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Notification Preferences</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Customize which channels (in-app alerts, email digest, push) notify you for academic and campus events.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {prefSaveSuccess && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Preferences Saved
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("ALL")}
                className="text-xs"
              >
                Back to Notifications
              </Button>
            </div>
          </div>

          {/* In-App Alerts Channel */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              In-App Real-Time Alerts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  key: "inAppDeadlines",
                  label: "Assignment & Exam Deadlines",
                  desc: "Timely alerts when deadlines are due within 24–48 hours.",
                },
                {
                  key: "inAppAssignments",
                  label: "New Assignments & Coursework",
                  desc: "Alerts when faculties open new submission portals.",
                },
                {
                  key: "inAppTeamRequests",
                  label: "Hackathon & Capstone Teammate Invites",
                  desc: "Alerts when students apply to join your project roles.",
                },
                {
                  key: "inAppCommunity",
                  label: "Student Community & Answers",
                  desc: "Replies, accepted solutions, and doubt updates.",
                },
                {
                  key: "inAppSecurity",
                  label: "Account Security & New Logins",
                  desc: "Instant warning if login is detected from an unrecognized device.",
                },
                {
                  key: "inAppAiCompletion",
                  label: "AI Study Assistant & RAG Ingestion",
                  desc: "Notification when PDF chunking and vector embeddings finish.",
                },
                {
                  key: "inAppSystem",
                  label: "Placement Drives & Official Notices",
                  desc: "Campus placements, company OAs, and college announcements.",
                },
              ].map((item) => {
                const isEnabled = preferences[item.key as keyof NotificationPreferenceItem];
                return (
                  <div
                    key={item.key}
                    onClick={() =>
                      handleTogglePreference(item.key as keyof NotificationPreferenceItem)
                    }
                    className="p-3.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{item.desc}</p>
                    </div>
                    <div
                      className={`w-10 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${
                        isEnabled ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          isEnabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Email & Push Notification Channels */}
          <div className="space-y-4 pt-4 border-t border-zinc-200/60 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Email Digest & External Delivery
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  key: "emailDigest",
                  icon: Mail,
                  label: "Weekly Academic Digest",
                  desc: "Summary of upcoming classes, assignments, and campus placement drives.",
                },
                {
                  key: "emailSecurity",
                  icon: ShieldAlert,
                  label: "Critical Security Alerts",
                  desc: "Immediate email for password resets and session revocations.",
                },
                {
                  key: "emailTeamRequests",
                  icon: Rocket,
                  label: "Teammate Application Emails",
                  desc: "Email alerts when someone applies to your hackathon project.",
                },
                {
                  key: "pushEnabled",
                  icon: Smartphone,
                  label: "Browser Push Notifications",
                  desc: "Push alerts even when the CampusFlow browser tab is closed.",
                },
              ].map((item) => {
                const Icon = item.icon;
                const isEnabled = preferences[item.key as keyof NotificationPreferenceItem];
                return (
                  <div
                    key={item.key}
                    onClick={() =>
                      handleTogglePreference(item.key as keyof NotificationPreferenceItem)
                    }
                    className="p-3.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {item.label}
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <div
                      className={`w-10 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${
                        isEnabled ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          isEnabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: Notification Items Feed */
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/20">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Inbox Zero!
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `No alerts matching "${searchQuery}". Try a different keyword.`
                  : activeTab === "UNREAD"
                  ? "You have read all pending notifications. Great job staying organized!"
                  : "No alerts in this category right now. You're completely up to date."}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="mt-4 text-xs"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const isUrgent = notification.priority === "URGENT";
              const isHigh = notification.priority === "HIGH";

              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 group ${
                    notification.read
                      ? "border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/30 opacity-80 hover:opacity-100"
                      : isUrgent
                      ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 shadow-xs"
                      : isHigh
                      ? "border-amber-300 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs"
                      : "border-indigo-200/70 dark:border-indigo-900/40 bg-white dark:bg-zinc-900/70 shadow-xs"
                  }`}
                >
                  {/* Left Icon & Body */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs shrink-0 mt-0.5">
                      {getTypeIcon(notification.type)}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-sm ${
                            notification.read
                              ? "font-medium text-zinc-700 dark:text-zinc-300"
                              : "font-bold text-zinc-900 dark:text-zinc-50"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                        )}
                        {getPriorityBadge(notification.priority)}
                      </div>

                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-zinc-400">
                        <span className="font-mono">{formatRelativeTime(notification.createdAt)}</span>
                        <span>•</span>
                        <span className="capitalize">{notification.type.toLowerCase().replace(/_/g, " ")}</span>
                        {notification.read && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Read
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center sm:self-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                    {notification.link && (
                      <Link href={notification.link}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (!notification.read) {
                              handleToggleRead(notification.id, false);
                            }
                          }}
                          className="h-8 text-xs gap-1 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </Link>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleRead(notification.id, notification.read)}
                      className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                      title={notification.read ? "Mark as unread" : "Mark as read"}
                    >
                      {notification.read ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
