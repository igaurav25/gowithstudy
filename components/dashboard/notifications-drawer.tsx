"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StudentNotificationItem } from "@/services/dashboard-service";
import {
  Bell,
  CheckCheck,
  Calendar,
  Clock,
  Briefcase,
  Users,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Rocket,
  X,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { markAsReadAction, markAllAsReadAction } from "@/features/notifications/actions";

export function NotificationsDrawer({
  initialNotifications,
}: {
  initialNotifications: StudentNotificationItem[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState(initialNotifications);
  const [isPending, startTransition] = React.useTransition();
  const drawerRef = React.useRef<HTMLDivElement>(null);

  // Sync state if initialNotifications changes
  React.useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    startTransition(async () => {
      await markAllAsReadAction();
    });
  };

  const handleItemClick = (item: StudentNotificationItem) => {
    if (!item.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
      startTransition(async () => {
        await markAsReadAction(item.id, true);
      });
    }

    if (item.link) {
      setOpen(false);
      router.push(item.link);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "DEADLINE_WARNING":
        return <Clock className="w-4 h-4 text-rose-500" />;
      case "ASSIGNMENT":
      case "ASSIGNMENT_REMINDER":
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case "INTERVIEW":
        return <Briefcase className="w-4 h-4 text-indigo-500" />;
      case "TEAM_REQUEST":
        return <Rocket className="w-4 h-4 text-violet-500" />;
      case "COMMUNITY":
      case "COMMUNITY_INTERACTION":
        return <Users className="w-4 h-4 text-sky-500" />;
      case "SECURITY_ALERT":
        return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case "AI_COMPLETION":
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case "MODERATION_NOTICE":
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="relative" ref={drawerRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200/80 dark:border-zinc-800"
        aria-label="Open notifications center"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Drawer Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Notifications
              </h4>
              {unreadCount > 0 ? (
                <Badge variant="purple" className="text-[10px]">
                  {unreadCount} unread
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px]">
                  All caught up
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={isPending}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Mark all notifications as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2 mt-3 max-h-80 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Inbox zero!
                </p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                  No notifications right now.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 hover:translate-x-0.5 ${
                    item.read
                      ? "border-transparent bg-zinc-50/60 dark:bg-zinc-900/40 opacity-75 hover:opacity-100"
                      : "border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs"
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shrink-0 mt-0.5 shadow-2xs">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-xs truncate ${
                          item.read
                            ? "font-medium text-zinc-800 dark:text-zinc-200"
                            : "font-semibold text-zinc-900 dark:text-zinc-100"
                        }`}
                      >
                        {item.title}
                      </p>
                      {!item.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {item.timestamp}
                      </span>
                      {item.link && (
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium inline-flex items-center gap-0.5">
                          View details <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Navigation */}
          <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Open Notification Center</span>
              <span>&rarr;</span>
            </Link>
            <Link
              href="/dashboard/notifications?tab=settings"
              onClick={() => setOpen(false)}
              className="text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              Preferences
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
