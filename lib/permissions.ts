import { Role } from "./rbac";

export type Permission =
  // Student permissions
  | "DASHBOARD_ACCESS"
  | "NOTES_VIEW"
  | "NOTES_CREATE"
  | "AI_TUTOR_CHAT"
  | "TIMETABLE_MANAGE"
  | "ASSIGNMENTS_MANAGE"
  | "DSA_TRACKER"
  | "INTERNSHIPS_TRACKER"
  | "COMMUNITY_POST"
  | "COMMUNITY_COMMENT"
  | "TEAM_FINDER"
  // Teacher permissions
  | "TEACHER_DASHBOARD"
  | "ASSIGNMENTS_CREATE_CLASS"
  | "COLLEGE_NOTICES_PUBLISH"
  // Moderator permissions
  | "MODERATION_QUEUE_VIEW"
  | "MODERATION_ACTION"
  | "CONTENT_REPORT_RESOLVE"
  // Admin permissions
  | "ADMIN_PORTAL_ACCESS"
  | "APPLICATIONS_VIEW"
  | "APPLICATIONS_REVIEW"
  | "USERS_VIEW"
  | "USERS_SUSPEND"
  | "ANNOUNCEMENTS_CREATE"
  | "AUDIT_LOG_VIEW"
  // Super Admin permissions
  | "ADMIN_PROVISION"
  | "SYSTEM_SETTINGS_MANAGE"
  | "DESTRUCTIVE_ACTIONS";

const STUDENT_PERMISSIONS: ReadonlySet<Permission> = new Set([
  "DASHBOARD_ACCESS",
  "NOTES_VIEW",
  "NOTES_CREATE",
  "AI_TUTOR_CHAT",
  "TIMETABLE_MANAGE",
  "ASSIGNMENTS_MANAGE",
  "DSA_TRACKER",
  "INTERNSHIPS_TRACKER",
  "COMMUNITY_POST",
  "COMMUNITY_COMMENT",
  "TEAM_FINDER",
]);

const TEACHER_PERMISSIONS: ReadonlySet<Permission> = new Set([
  ...STUDENT_PERMISSIONS,
  "TEACHER_DASHBOARD",
  "ASSIGNMENTS_CREATE_CLASS",
  "COLLEGE_NOTICES_PUBLISH",
]);

const MODERATOR_PERMISSIONS: ReadonlySet<Permission> = new Set([
  ...STUDENT_PERMISSIONS,
  "MODERATION_QUEUE_VIEW",
  "MODERATION_ACTION",
  "CONTENT_REPORT_RESOLVE",
]);

const ADMIN_PERMISSIONS: ReadonlySet<Permission> = new Set([
  ...TEACHER_PERMISSIONS,
  ...MODERATOR_PERMISSIONS,
  "ADMIN_PORTAL_ACCESS",
  "APPLICATIONS_VIEW",
  "APPLICATIONS_REVIEW",
  "USERS_VIEW",
  "USERS_SUSPEND",
  "ANNOUNCEMENTS_CREATE",
  "AUDIT_LOG_VIEW",
]);

const SUPER_ADMIN_PERMISSIONS: ReadonlySet<Permission> = new Set([
  ...ADMIN_PERMISSIONS,
  "ADMIN_PROVISION",
  "SYSTEM_SETTINGS_MANAGE",
  "DESTRUCTIVE_ACTIONS",
]);

const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  USER: STUDENT_PERMISSIONS,
  STUDENT: STUDENT_PERMISSIONS,
  TEACHER: TEACHER_PERMISSIONS,
  MODERATOR: MODERATOR_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
  SUPER_ADMIN: SUPER_ADMIN_PERMISSIONS,
};

/**
 * Evaluates whether a given user role possesses a specific capability.
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.has(permission);
}

/**
 * Checks whether an applicant type maps to the correct target role.
 */
export function getRoleForApplicationType(type: "STUDENT" | "TEACHER"): Role {
  return type === "TEACHER" ? "TEACHER" : "STUDENT";
}
