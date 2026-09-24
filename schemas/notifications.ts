import { z } from "zod";

export const NOTIFICATION_TYPES = [
  "ASSIGNMENT_REMINDER",
  "DEADLINE_WARNING",
  "TEAM_REQUEST",
  "COMMUNITY_INTERACTION",
  "MODERATION_NOTICE",
  "SECURITY_ALERT",
  "SYSTEM_ANNOUNCEMENT",
  "AI_COMPLETION",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
] as const;

export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number];

/**
 * Schema for creating a notification
 */
export const createNotificationSchema = z.object({
  type: z.enum(NOTIFICATION_TYPES, {
    message: "Invalid notification type",
  }),
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(120, { message: "Title cannot exceed 120 characters" }),
  message: z
    .string()
    .min(5, { message: "Message must be at least 5 characters" })
    .max(500, { message: "Message cannot exceed 500 characters" }),
  link: z.string().optional().nullable(),
  priority: z
    .enum(NOTIFICATION_PRIORITIES)
    .default("MEDIUM"),
  metadata: z.record(z.string(), z.any()).optional().nullable(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

/**
 * Schema for updating user notification preferences
 */
export const updateNotificationPreferencesSchema = z.object({
  inAppAssignments: z.boolean().default(true),
  inAppDeadlines: z.boolean().default(true),
  inAppTeamRequests: z.boolean().default(true),
  inAppCommunity: z.boolean().default(true),
  inAppSecurity: z.boolean().default(true),
  inAppSystem: z.boolean().default(true),
  inAppAiCompletion: z.boolean().default(true),
  emailDigest: z.boolean().default(true),
  emailSecurity: z.boolean().default(true),
  emailTeamRequests: z.boolean().default(false),
  pushEnabled: z.boolean().default(false),
});

export type UpdateNotificationPreferencesInput = z.infer<
  typeof updateNotificationPreferencesSchema
>;

/**
 * Filter schema for querying notifications
 */
export const notificationFilterSchema = z.object({
  type: z.enum(NOTIFICATION_TYPES).optional(),
  read: z.boolean().optional(),
  priority: z.enum(NOTIFICATION_PRIORITIES).optional(),
  category: z.enum(["ALL", "UNREAD", "DEADLINES", "COMMUNITY", "SYSTEM"]).optional(),
});

export type NotificationFilterInput = z.infer<typeof notificationFilterSchema>;
