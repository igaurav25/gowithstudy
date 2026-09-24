import { z } from "zod";
import { ROLES, Role } from "@/lib/rbac";

export const ANNOUNCEMENT_CATEGORIES = [
  "ACADEMIC",
  "PLACEMENT",
  "MAINTENANCE",
  "CAMPUS_EVENT",
  "GENERAL",
] as const;

export type AnnouncementCategory = (typeof ANNOUNCEMENT_CATEGORIES)[number];

export const ANNOUNCEMENT_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
] as const;

export type AnnouncementPriority = (typeof ANNOUNCEMENT_PRIORITIES)[number];

export const REPORT_ACTIONS = [
  "DISMISS",
  "DELETE_CONTENT",
  "WARN_USER",
  "SUSPEND_USER",
] as const;

export type ReportActionTaken = (typeof REPORT_ACTIONS)[number];

/**
 * Schema for updating user role (ADMIN-only)
 */
export const updateUserRoleSchema = z.object({
  targetUserId: z.string().min(1, { message: "Target user ID is required" }),
  role: z.enum(["USER", "MODERATOR", "ADMIN"], {
    message: "Role must be USER, MODERATOR, or ADMIN",
  }),
  reason: z
    .string()
    .min(5, { message: "Please provide a reason (min 5 characters)" })
    .max(300, { message: "Reason cannot exceed 300 characters" }),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

/**
 * Schema for toggling user account suspension (ADMIN-only)
 */
export const toggleUserStatusSchema = z.object({
  targetUserId: z.string().min(1, { message: "Target user ID is required" }),
  isSuspended: z.boolean(),
  reason: z
    .string()
    .min(5, { message: "Reason must be at least 5 characters" })
    .max(300, { message: "Reason cannot exceed 300 characters" }),
});

export type ToggleUserStatusInput = z.infer<typeof toggleUserStatusSchema>;

/**
 * Schema for resolving flagged moderation reports (MODERATOR/ADMIN)
 */
export const resolveReportSchema = z.object({
  reportId: z.string().min(1, { message: "Report ID is required" }),
  status: z.enum(["RESOLVED", "REJECTED"], {
    message: "Status must be RESOLVED or REJECTED",
  }),
  actionTaken: z.enum(REPORT_ACTIONS, {
    message: "Invalid moderation action taken",
  }),
  resolutionNote: z
    .string()
    .min(5, { message: "Resolution notes must be at least 5 characters" })
    .max(500, { message: "Resolution notes cannot exceed 500 characters" }),
});

export type ResolveReportInput = z.infer<typeof resolveReportSchema>;

/**
 * Schema for creating a verified campus announcement (ADMIN/MODERATOR)
 */
export const createAnnouncementSchema = z.object({
  title: z
    .string()
    .min(4, { message: "Title must be at least 4 characters" })
    .max(120, { message: "Title cannot exceed 120 characters" }),
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 characters" })
    .max(2000, { message: "Content cannot exceed 2000 characters" }),
  category: z.enum(ANNOUNCEMENT_CATEGORIES).default("GENERAL"),
  priority: z.enum(ANNOUNCEMENT_PRIORITIES).default("MEDIUM"),
  isPinned: z.boolean().default(false),
  targetAudience: z.enum(["ALL", "STUDENTS", "FACULTY"]).default("ALL"),
  expiresAt: z.string().optional().nullable(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;

/**
 * Schema for filtering users in admin panel
 */
export const adminUserFilterSchema = z.object({
  query: z.string().optional(),
  role: z.enum(["ALL", "USER", "MODERATOR", "ADMIN"]).optional(),
  status: z.enum(["ALL", "ACTIVE", "SUSPENDED"]).optional(),
});

export type AdminUserFilterInput = z.infer<typeof adminUserFilterSchema>;
