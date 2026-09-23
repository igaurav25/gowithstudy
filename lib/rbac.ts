export type Role = "USER" | "MODERATOR" | "ADMIN";

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
  MODERATOR: "MODERATOR" as Role,
  ADMIN: "ADMIN" as Role,
};

export const ROLE_HIERARCHY: Record<Role, number> = {
  USER: 1,
  MODERATOR: 2,
  ADMIN: 3,
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
