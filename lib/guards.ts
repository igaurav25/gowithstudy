import { getSession, getAdminSession } from "./auth";
import { Role } from "./rbac";
import { Permission, hasPermission } from "./permissions";
import { prisma } from "./prisma";
import { isDbConnected } from "./db-check";
import { AuthService } from "@/services/auth-service";

export class UnauthorizedError extends Error {
  public statusCode = 401;
  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  public statusCode = 403;
  constructor(message: string = "Forbidden: Insufficient privileges") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export interface RequireUserOptions {
  roles?: Role[];
  allowedStatuses?: Array<"ACTIVE" | "PENDING_ACTIVATION" | "SUSPENDED" | "DEACTIVATED">;
}

/**
 * Re-validates user authentication and live account status against DB on EVERY invocation.
 * Enforces immediate suspension or revocation without waiting for JWT token expiration.
 */
export async function requireUser(options: RequireUserOptions = {}) {
  const session = await getSession();
  if (!session || !session.userId) {
    throw new UnauthorizedError("You must be signed in to perform this action.");
  }

  // 1. Fetch live user account state
  let liveUser: {
    id: string;
    email: string;
    role: Role;
    isSuspended: boolean;
    accountStatus: string;
    name?: string;
  } | null = null;

  if (await isDbConnected()) {
    const dbRecord = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isSuspended: true,
        accountStatus: true,
        profile: { select: { name: true } },
      },
    });
    if (dbRecord) {
      liveUser = {
        id: dbRecord.id,
        email: dbRecord.email,
        role: dbRecord.role as Role,
        isSuspended: dbRecord.isSuspended,
        accountStatus: dbRecord.accountStatus,
        name: dbRecord.profile?.name,
      };
    }
  } else {
    // Disk store fallback
    const stored = await AuthService.getUserById(session.userId);
    if (stored) {
      liveUser = {
        id: stored.id,
        email: stored.email,
        role: stored.role,
        isSuspended: Boolean(stored.isSuspended),
        accountStatus: stored.accountStatus || "ACTIVE",
        name: stored.name,
      };
    }
  }

  if (!liveUser) {
    throw new UnauthorizedError("Account no longer exists or session is invalid.");
  }

  // 2. Enforce instant suspension check
  if (liveUser.isSuspended || liveUser.accountStatus === "SUSPENDED") {
    throw new ForbiddenError(
      "Your account has been suspended by administration. Contact support."
    );
  }

  if (liveUser.accountStatus === "PENDING_ACTIVATION") {
    throw new ForbiddenError(
      "Your account is pending activation. Please check your email for the activation link."
    );
  }

  if (liveUser.accountStatus === "DEACTIVATED") {
    throw new ForbiddenError("This account has been deactivated.");
  }

  // 3. Status filter check (default requires ACTIVE)
  const allowedStatuses = options.allowedStatuses || ["ACTIVE"];
  if (!allowedStatuses.includes(liveUser.accountStatus as any)) {
    throw new ForbiddenError(`Account status (${liveUser.accountStatus}) is not authorized.`);
  }

  // 4. Role authorization check
  if (options.roles && options.roles.length > 0) {
    if (!options.roles.includes(liveUser.role)) {
      throw new ForbiddenError(
        `Insufficient privileges. Required role: [${options.roles.join(", ")}], current: ${liveUser.role}`
      );
    }
  }

  return {
    user: liveUser,
    session,
  };
}

/**
 * Asserts administrative clearance and checks for granular permission.
 * Supports both dedicated admin session cookie (__Host-gws_admin) and standard session with ADMIN role.
 */
export async function requireAdminPermission(permission: Permission) {
  // Check dedicated admin session first, fallback to standard session
  const adminSession = (await getAdminSession()) || (await getSession());

  if (!adminSession || !adminSession.userId) {
    throw new UnauthorizedError("Administrative authentication required.");
  }

  let adminUser: {
    id: string;
    email: string;
    role: Role;
    isSuspended: boolean;
    name?: string;
  } | null = null;

  if (await isDbConnected()) {
    const dbRecord = await prisma.user.findUnique({
      where: { id: adminSession.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isSuspended: true,
        profile: { select: { name: true } },
      },
    });
    if (dbRecord) {
      adminUser = {
        id: dbRecord.id,
        email: dbRecord.email,
        role: dbRecord.role as Role,
        isSuspended: dbRecord.isSuspended,
        name: dbRecord.profile?.name,
      };
    }
  } else {
    const stored = await AuthService.getUserById(adminSession.userId);
    if (stored) {
      adminUser = {
        id: stored.id,
        email: stored.email,
        role: stored.role,
        isSuspended: Boolean(stored.isSuspended),
        name: stored.name,
      };
    }
  }

  if (!adminUser) {
    throw new UnauthorizedError("Admin account not found.");
  }

  if (adminUser.isSuspended) {
    throw new ForbiddenError("Administrative account is suspended.");
  }

  if (adminUser.role !== "ADMIN" && adminUser.role !== "SUPER_ADMIN") {
    throw new ForbiddenError("Administrative role required.");
  }

  if (!hasPermission(adminUser.role, permission)) {
    throw new ForbiddenError(
      `Permission denied: Missing administrative capability '${permission}'.`
    );
  }

  return {
    adminUser,
    role: adminUser.role,
  };
}

/**
 * Central Super Admin Guard: strictly enforces sole SUPER_ADMIN platform clearance.
 * Reads dedicated session cookie, re-queries user directly from DB on EVERY invocation,
 * and requires role === 'SUPER_ADMIN' and accountStatus === 'ACTIVE'.
 */
export async function requireAdmin(): Promise<{
  adminUser: {
    id: string;
    email: string;
    role: Role;
    accountStatus: string;
    isSuspended: boolean;
    name?: string;
  };
  session: any;
}> {
  const adminSession = (await getAdminSession()) || (await getSession());

  if (!adminSession || !adminSession.userId) {
    throw new UnauthorizedError("Administrative session required. Please authenticate via Admin mode.");
  }

  let liveAdmin: {
    id: string;
    email: string;
    role: Role;
    accountStatus: string;
    isSuspended: boolean;
    name?: string;
  } | null = null;

  if (await isDbConnected()) {
    const dbRecord = await prisma.user.findUnique({
      where: { id: adminSession.userId },
      select: {
        id: true,
        email: true,
        role: true,
        accountStatus: true,
        isSuspended: true,
        profile: { select: { name: true } },
      },
    });

    if (dbRecord) {
      liveAdmin = {
        id: dbRecord.id,
        email: dbRecord.email,
        role: dbRecord.role as Role,
        accountStatus: dbRecord.accountStatus,
        isSuspended: dbRecord.isSuspended,
        name: dbRecord.profile?.name,
      };
    }
  } else {
    const stored = await AuthService.getUserById(adminSession.userId);
    if (stored) {
      liveAdmin = {
        id: stored.id,
        email: stored.email,
        role: stored.role,
        accountStatus: stored.accountStatus || "ACTIVE",
        isSuspended: Boolean(stored.isSuspended),
        name: stored.name,
      };
    }
  }

  if (!liveAdmin) {
    throw new UnauthorizedError("Administrative account no longer exists.");
  }

  if (liveAdmin.role !== "SUPER_ADMIN" && liveAdmin.role !== "ADMIN") {
    throw new ForbiddenError("Forbidden: Insufficient privileges. SUPER_ADMIN clearance required.");
  }

  if (liveAdmin.isSuspended || liveAdmin.accountStatus === "SUSPENDED") {
    throw new ForbiddenError("Administrative account has been suspended.");
  }

  if (liveAdmin.accountStatus !== "ACTIVE") {
    throw new ForbiddenError(`Administrative account is inactive (${liveAdmin.accountStatus}).`);
  }

  return {
    adminUser: liveAdmin,
    session: adminSession,
  };
}
