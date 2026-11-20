export type Role = "USER" | "STUDENT" | "TEACHER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";

export interface UserSessionPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
  college?: string;
  course?: string;
  branch?: string;
  year?: number;
  semester?: number;
  sessionId: string;
}

export const ROLES = {
  USER: "USER" as Role,
  STUDENT: "STUDENT" as Role,
  TEACHER: "TEACHER" as Role,
  MODERATOR: "MODERATOR" as Role,
  ADMIN: "ADMIN" as Role,
  SUPER_ADMIN: "SUPER_ADMIN" as Role,
};

export const ROLE_HIERARCHY: Record<Role, number> = {
  USER: 1,
  STUDENT: 1,
  TEACHER: 1,
  MODERATOR: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

/**
 * Checks if a user has at least the required role clearance.
 */
export function hasRequiredRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Asserts server-side role clearance, throwing an error if unauthorized.
 */
export function assertRole(userRole: Role, requiredRole: Role): void {
  if (!hasRequiredRole(userRole, requiredRole)) {
    throw new Error(`Forbidden: Insufficient privileges. Required ${requiredRole}, got ${userRole}`);
  }
}
