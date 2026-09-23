"use client";

import * as React from "react";
import { StudentNotificationItem } from "@/services/dashboard-service";
import { Bell, CheckCheck, Clock, Calendar, Briefcase, Users, ShieldAlert, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function NotificationsDrawer({
  initialNotifications,
}: {
  initialNotifications: StudentNotificationItem[];
}) {
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ASSIGNMENT":
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case "INTERVIEW":
        return <Briefcase className="w-4 h-4 text-indigo-500" />;
      case "COMMUNITY":
        return <Users className="w-4 h-4 text-violet-500" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="relative">
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
            {unreadCount}
          </span>
        )}
      </button>

      {/* Drawer Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <Badge variant="purple" className="text-[10px]">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" />
                  Mark read
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2 mt-3 max-h-80 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <p className="text-center py-6 text-xs text-zinc-500">
                No notifications right now.
              </p>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-colors flex items-start gap-3 ${
                    item.read
                      ? "border-transparent bg-zinc-50/50 dark:bg-zinc-900/30 opacity-70"
                      : "border-indigo-100 dark:border-indigo-950 bg-indigo-50/40 dark:bg-indigo-950/20"
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shrink-0 mt-0.5">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                    <span className="text-[10px] text-zinc-400 font-mono mt-1 block">
                      {item.timestamp}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
