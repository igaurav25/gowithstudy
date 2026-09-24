import { prisma } from "@/lib/prisma";
import {
  NotificationType,
  NotificationPriority,
  CreateNotificationInput,
  UpdateNotificationPreferencesInput,
  NotificationFilterInput,
} from "@/schemas/notifications";

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  priority: NotificationPriority;
  read: boolean;
  readAt: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferenceItem {
  id: string;
  userId: string;
  inAppAssignments: boolean;
  inAppDeadlines: boolean;
  inAppTeamRequests: boolean;
  inAppCommunity: boolean;
  inAppSecurity: boolean;
  inAppSystem: boolean;
  inAppAiCompletion: boolean;
  emailDigest: boolean;
  emailSecurity: boolean;
  emailTeamRequests: boolean;
  pushEnabled: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  urgentCount: number;
  deadlinesCount: number;
}

// In-Memory fallback store for environments without active DATABASE_URL
let inMemoryNotifications: NotificationItem[] = [];
let inMemoryPreferences: Record<string, NotificationPreferenceItem> = {};
let isInitialized = false;

function initializeDemoNotifications() {
  if (isInitialized && inMemoryNotifications.length > 0) return;

  const now = new Date();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

  inMemoryNotifications = [
    {
      id: "notif_cd_due",
      userId: "demo_user",
      type: "DEADLINE_WARNING",
      title: "Compiler Design Assignment 3 Due Soon",
      message: "LL(1) Parser & Syntax Directed Translation assignment is due in 18 hours. Submit via Assignment Manager.",
      link: "/dashboard/assignments",
      priority: "HIGH",
      read: false,
      readAt: null,
      metadata: { assignmentId: "asgn_2", subject: "Compiler Design" },
      createdAt: hoursAgo(2),
      updatedAt: hoursAgo(2),
    },
    {
      id: "notif_team_sih",
      userId: "demo_user",
      type: "TEAM_REQUEST",
      title: "New Teammate Application for SIH 2026",
      message: "Rohan Verma applied for 'Mobile Flutter Developer' on Smart India Hackathon: Edge Video Analytics.",
      link: "/dashboard/projects/proj_sih_1",
      priority: "MEDIUM",
      read: false,
      readAt: null,
      metadata: { projectId: "proj_sih_1", applicant: "Rohan Verma" },
      createdAt: hoursAgo(4),
      updatedAt: hoursAgo(4),
    },
    {
      id: "notif_comm_acc",
      userId: "demo_user",
      type: "COMMUNITY_INTERACTION",
      title: "Your Answer was Accepted as Solution",
      message: "Ananya Sharma accepted your explanation on 'Strict 2PL vs Rigorous 2PL in DBMS Transactions'. +15 student rep earned.",
      link: "/dashboard/community/post_dbms_2",
      priority: "LOW",
      read: false,
      readAt: null,
      metadata: { postId: "post_dbms_2" },
      createdAt: hoursAgo(8),
      updatedAt: hoursAgo(8),
    },
    {
      id: "notif_sec_login",
      userId: "demo_user",
      type: "SECURITY_ALERT",
      title: "New Session Login Detected",
      message: "A new persistent login session was initiated on Windows 11 (Chrome 134) via Campus Wi-Fi AP-304.",
      link: "/dashboard/profile",
      priority: "URGENT",
      read: false,
      readAt: null,
      metadata: { ip: "10.207.184.32", userAgent: "Chrome 134 / Windows" },
      createdAt: hoursAgo(14),
      updatedAt: hoursAgo(14),
    },
    {
      id: "notif_sys_oa",
      userId: "demo_user",
      type: "SYSTEM_ANNOUNCEMENT",
      title: "TCS CodeVita & Google OA Schedules Out",
      message: "Official dates for Summer 2027 internship OAs and national coding qualifiers have been pinned in Placement Tracker.",
      link: "/dashboard/placement",
      priority: "MEDIUM",
      read: true,
      readAt: hoursAgo(20),
      metadata: { category: "PLACEMENTS" },
      createdAt: daysAgo(1),
      updatedAt: hoursAgo(20),
    },
    {
      id: "notif_ai_rag",
      userId: "demo_user",
      type: "AI_COMPLETION",
      title: "AI Study Material Indexing Finished",
      message: "'Operating Systems Three Easy Pieces.pdf' was chunked and indexed into vector embeddings. 14 chunks ready for RAG query.",
      link: "/dashboard/ai",
      priority: "LOW",
      read: true,
      readAt: hoursAgo(22),
      metadata: { noteId: "note_os_1" },
      createdAt: daysAgo(1),
      updatedAt: hoursAgo(22),
    },
    {
      id: "notif_asgn_portal",
      userId: "demo_user",
      type: "ASSIGNMENT_REMINDER",
      title: "Computer Networks Lab 4 Submission Open",
      message: "Wireshark Packet Analysis submission portal is open. Deadline is next Tuesday at 11:59 PM.",
      link: "/dashboard/assignments",
      priority: "MEDIUM",
      read: true,
      readAt: daysAgo(2),
      metadata: { subject: "Computer Networks" },
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      id: "notif_mod_ok",
      userId: "demo_user",
      type: "MODERATION_NOTICE",
      title: "Community Post Verified by Moderator",
      message: "Your query on Codeforces vs LeetCode contest efficiency was verified and tagged with #dsa #contests.",
      link: "/dashboard/community",
      priority: "LOW",
      read: true,
      readAt: daysAgo(3),
      metadata: { status: "APPROVED" },
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },
  ];

  isInitialized = true;
}

export const NotificationsService = {
  /**
   * Get all notifications for a user with optional category/read filtering
   */
  async getNotifications(
    userId: string,
    filters?: NotificationFilterInput
  ): Promise<NotificationItem[]> {
    initializeDemoNotifications();

    try {
      const where: any = { userId };

      if (filters?.type) {
        where.type = filters.type;
      }
      if (typeof filters?.read === "boolean") {
        where.read = filters.read;
      }
      if (filters?.priority) {
        where.priority = filters.priority;
      }

      if (filters?.category) {
        switch (filters.category) {
          case "UNREAD":
            where.read = false;
            break;
          case "DEADLINES":
            where.type = { in: ["DEADLINE_WARNING", "ASSIGNMENT_REMINDER"] };
            break;
          case "COMMUNITY":
            where.type = { in: ["TEAM_REQUEST", "COMMUNITY_INTERACTION"] };
            break;
          case "SYSTEM":
            where.type = { in: ["SYSTEM_ANNOUNCEMENT", "SECURITY_ALERT", "MODERATION_NOTICE", "AI_COMPLETION"] };
            break;
        }
      }

      const dbNotifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      if (dbNotifications && dbNotifications.length > 0) {
        return dbNotifications.map((n) => ({
          id: n.id,
          userId: n.userId,
          type: n.type as NotificationType,
          title: n.title,
          message: n.message,
          link: n.link,
          priority: n.priority as NotificationPriority,
          read: n.read,
          readAt: n.readAt ? n.readAt.toISOString() : null,
          metadata: n.metadata ? JSON.parse(n.metadata) : null,
          createdAt: n.createdAt.toISOString(),
          updatedAt: n.updatedAt.toISOString(),
        }));
      }
    } catch {
      // Fallback to in-memory store
    }

    // In-memory filtering
    let list = [...inMemoryNotifications];

    if (filters?.type) {
      list = list.filter((n) => n.type === filters.type);
    }
    if (typeof filters?.read === "boolean") {
      list = list.filter((n) => n.read === filters.read);
    }
    if (filters?.priority) {
      list = list.filter((n) => n.priority === filters.priority);
    }

    if (filters?.category) {
      switch (filters.category) {
        case "UNREAD":
          list = list.filter((n) => !n.read);
          break;
        case "DEADLINES":
          list = list.filter((n) => n.type === "DEADLINE_WARNING" || n.type === "ASSIGNMENT_REMINDER");
          break;
        case "COMMUNITY":
          list = list.filter((n) => n.type === "TEAM_REQUEST" || n.type === "COMMUNITY_INTERACTION");
          break;
        case "SYSTEM":
          list = list.filter(
            (n) =>
              n.type === "SYSTEM_ANNOUNCEMENT" ||
              n.type === "SECURITY_ALERT" ||
              n.type === "MODERATION_NOTICE" ||
              n.type === "AI_COMPLETION"
          );
          break;
      }
    }

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  /**
   * Get unread notifications count for badge indicators
   */
  async getUnreadCount(userId: string): Promise<number> {
    initializeDemoNotifications();

    try {
      const count = await prisma.notification.count({
        where: { userId, read: false },
      });
      if (typeof count === "number") return count;
    } catch {
      // Fallback
    }

    return inMemoryNotifications.filter((n) => !n.read).length;
  },

  /**
   * Get notification statistics for dashboard / notification center
   */
  async getNotificationStats(userId: string): Promise<NotificationStats> {
    const all = await this.getNotifications(userId);
    const unread = all.filter((n) => !n.read).length;
    const urgentCount = all.filter((n) => n.priority === "URGENT" || n.priority === "HIGH").length;
    const deadlinesCount = all.filter(
      (n) => n.type === "DEADLINE_WARNING" || n.type === "ASSIGNMENT_REMINDER"
    ).length;

    return {
      total: all.length,
      unread,
      urgentCount,
      deadlinesCount,
    };
  },

  /**
   * Mark a single notification as read or unread
   */
  async markAsRead(id: string, userId: string, read: boolean = true): Promise<boolean> {
    initializeDemoNotifications();

    try {
      await prisma.notification.updateMany({
        where: { id, userId },
        data: {
          read,
          readAt: read ? new Date() : null,
        },
      });
      return true;
    } catch {
      // Fallback
    }

    const item = inMemoryNotifications.find((n) => n.id === id);
    if (item) {
      item.read = read;
      item.readAt = read ? new Date().toISOString() : null;
      item.updatedAt = new Date().toISOString();
      return true;
    }

    return false;
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    initializeDemoNotifications();

    try {
      const res = await prisma.notification.updateMany({
        where: { userId, read: false },
        data: {
          read: true,
          readAt: new Date(),
        },
      });
      return res.count;
    } catch {
      // Fallback
    }

    let modified = 0;
    const nowIso = new Date().toISOString();
    inMemoryNotifications.forEach((n) => {
      if (!n.read) {
        n.read = true;
        n.readAt = nowIso;
        n.updatedAt = nowIso;
        modified++;
      }
    });

    return modified;
  },

  /**
   * Delete a single notification
   */
  async deleteNotification(id: string, userId: string): Promise<boolean> {
    initializeDemoNotifications();

    try {
      await prisma.notification.deleteMany({
        where: { id, userId },
      });
      return true;
    } catch {
      // Fallback
    }

    const idx = inMemoryNotifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      inMemoryNotifications.splice(idx, 1);
      return true;
    }

    return false;
  },

  /**
   * Clear all read notifications
   */
  async clearReadNotifications(userId: string): Promise<number> {
    initializeDemoNotifications();

    try {
      const res = await prisma.notification.deleteMany({
        where: { userId, read: true },
      });
      return res.count;
    } catch {
      // Fallback
    }

    const initialLength = inMemoryNotifications.length;
    inMemoryNotifications = inMemoryNotifications.filter((n) => !n.read);
    return initialLength - inMemoryNotifications.length;
  },

  /**
   * Create a new notification
   */
  async createNotification(
    userId: string,
    input: CreateNotificationInput
  ): Promise<NotificationItem> {
    initializeDemoNotifications();

    try {
      const created = await prisma.notification.create({
        data: {
          userId,
          type: input.type,
          title: input.title,
          message: input.message,
          link: input.link || null,
          priority: input.priority || "MEDIUM",
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        },
      });

      return {
        id: created.id,
        userId: created.userId,
        type: created.type as NotificationType,
        title: created.title,
        message: created.message,
        link: created.link,
        priority: created.priority as NotificationPriority,
        read: created.read,
        readAt: created.readAt ? created.readAt.toISOString() : null,
        metadata: created.metadata ? JSON.parse(created.metadata) : null,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch {
      // Fallback
    }

    const newItem: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link || null,
      priority: input.priority || "MEDIUM",
      read: false,
      readAt: null,
      metadata: input.metadata || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryNotifications.unshift(newItem);
    return newItem;
  },

  /**
   * Get user notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferenceItem> {
    try {
      const pref = await prisma.notificationPreference.findUnique({
        where: { userId },
      });
      if (pref) {
        return {
          id: pref.id,
          userId: pref.userId,
          inAppAssignments: pref.inAppAssignments,
          inAppDeadlines: pref.inAppDeadlines,
          inAppTeamRequests: pref.inAppTeamRequests,
          inAppCommunity: pref.inAppCommunity,
          inAppSecurity: pref.inAppSecurity,
          inAppSystem: pref.inAppSystem,
          inAppAiCompletion: pref.inAppAiCompletion,
          emailDigest: pref.emailDigest,
          emailSecurity: pref.emailSecurity,
          emailTeamRequests: pref.emailTeamRequests,
          pushEnabled: pref.pushEnabled,
        };
      }
    } catch {
      // Fallback
    }

    if (!inMemoryPreferences[userId]) {
      inMemoryPreferences[userId] = {
        id: `pref_${userId}`,
        userId,
        inAppAssignments: true,
        inAppDeadlines: true,
        inAppTeamRequests: true,
        inAppCommunity: true,
        inAppSecurity: true,
        inAppSystem: true,
        inAppAiCompletion: true,
        emailDigest: true,
        emailSecurity: true,
        emailTeamRequests: false,
        pushEnabled: false,
      };
    }

    return inMemoryPreferences[userId];
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(
    userId: string,
    input: UpdateNotificationPreferencesInput
  ): Promise<NotificationPreferenceItem> {
    try {
      const updated = await prisma.notificationPreference.upsert({
        where: { userId },
        update: input,
        create: {
          userId,
          ...input,
        },
      });

      return {
        id: updated.id,
        userId: updated.userId,
        inAppAssignments: updated.inAppAssignments,
        inAppDeadlines: updated.inAppDeadlines,
        inAppTeamRequests: updated.inAppTeamRequests,
        inAppCommunity: updated.inAppCommunity,
        inAppSecurity: updated.inAppSecurity,
        inAppSystem: updated.inAppSystem,
        inAppAiCompletion: updated.inAppAiCompletion,
        emailDigest: updated.emailDigest,
        emailSecurity: updated.emailSecurity,
        emailTeamRequests: updated.emailTeamRequests,
        pushEnabled: updated.pushEnabled,
      };
    } catch {
      // Fallback
    }

    inMemoryPreferences[userId] = {
      id: inMemoryPreferences[userId]?.id || `pref_${userId}`,
      userId,
      ...input,
    };

    return inMemoryPreferences[userId];
  },
};
