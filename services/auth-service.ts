import { hashPassword, comparePassword } from "@/lib/auth";
import { Role } from "@/lib/rbac";
import { SignupInput, LoginInput } from "@/schemas/auth";
import crypto from "crypto";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  college: string;
  course: string;
  branch: string;
  year: number;
  semester: number;
  emailVerified: boolean;
  avatarUrl?: string;
  createdAt: Date;
}

export interface VerificationToken {
  token: string;
  email: string;
  expiresAt: Date;
}

export interface PasswordResetToken {
  token: string;
  email: string;
  expiresAt: Date;
}

export interface ActiveSession {
  id: string;
  userId: string;
  userAgent?: string;
  createdAt: Date;
}

// In-memory persistent state across requests in current process (prepares cleanly for Prisma in Phase 4)
class AuthStore {
  public users: Map<string, StoredUser> = new Map();
  public verificationTokens: Map<string, VerificationToken> = new Map();
  public resetTokens: Map<string, PasswordResetToken> = new Map();
  public sessions: Map<string, ActiveSession> = new Map();
  private initialized = false;

  constructor() {
    this.initDefaultUsers();
  }

  private async initDefaultUsers() {
    if (this.initialized) return;
    this.initialized = true;

    const defaultPasswordHash = await hashPassword("Password123!");

    const defaultUsers: StoredUser[] = [
      {
        id: "usr_student_01",
        name: "Aarav Sharma",
        email: "student@campusflow.edu",
        passwordHash: defaultPasswordHash,
        role: "USER",
        college: "Delhi Technological University",
        course: "B.Tech",
        branch: "Computer Science & Engineering",
        year: 3,
        semester: 6,
        emailVerified: true,
        createdAt: new Date(),
      },
      {
        id: "usr_mod_01",
        name: "Priya Nair",
        email: "moderator@campusflow.edu",
        passwordHash: defaultPasswordHash,
        role: "MODERATOR",
        college: "IIT Bombay",
        course: "B.Tech",
        branch: "Information Technology",
        year: 4,
        semester: 8,
        emailVerified: true,
        createdAt: new Date(),
      },
      {
        id: "usr_admin_01",
        name: "System Administrator",
        email: "admin@campusflow.edu",
        passwordHash: defaultPasswordHash,
        role: "ADMIN",
        college: "CampusFlow Central",
        course: "Administration",
        branch: "Platform Governance",
        year: 4,
        semester: 8,
        emailVerified: true,
        createdAt: new Date(),
      },
    ];

    for (const u of defaultUsers) {
      this.users.set(u.email.toLowerCase(), u);
    }
  }
}

// Global singleton instance
const globalStore = (globalThis as unknown as { __authStore?: AuthStore });
if (!globalStore.__authStore) {
  globalStore.__authStore = new AuthStore();
}
const store = globalStore.__authStore;

export const AuthService = {
  /**
   * Registers a new student account.
   */
  async signup(input: SignupInput): Promise<{ user: StoredUser; verificationToken: string }> {
    const existing = store.users.get(input.email.toLowerCase());
    if (existing) {
      throw new Error("An account with this email address already exists.");
    }

    const passwordHash = await hashPassword(input.password);
    const userId = `usr_${crypto.randomBytes(8).toString("hex")}`;

    const newUser: StoredUser = {
      id: userId,
      name: input.name.trim(),
      email: input.email.toLowerCase(),
      passwordHash,
      role: "USER",
      college: input.college.trim(),
      course: input.course.trim(),
      branch: input.branch.trim(),
      year: input.year,
      semester: input.semester,
      emailVerified: false,
      createdAt: new Date(),
    };

    store.users.set(newUser.email, newUser);

    // Create verification token (valid for 24 hours)
    const token = crypto.randomBytes(32).toString("hex");
    store.verificationTokens.set(token, {
      token,
      email: newUser.email,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return { user: newUser, verificationToken: token };
  },

  /**
   * Authenticates user with credentials and creates a session.
   */
  async login(input: LoginInput): Promise<{ user: StoredUser; sessionId: string }> {
    const user = store.users.get(input.email.toLowerCase());
    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const isValid = await comparePassword(input.password, user.passwordHash);
    if (!isValid) {
      throw new Error("Invalid email or password.");
    }

    const sessionId = `ses_${crypto.randomBytes(16).toString("hex")}`;
    store.sessions.set(sessionId, {
      id: sessionId,
      userId: user.id,
      createdAt: new Date(),
    });

    return { user, sessionId };
  },

  /**
   * Verifies an email verification token.
   */
  async verifyEmail(token: string): Promise<StoredUser> {
    const record = store.verificationTokens.get(token);
    if (!record) {
      throw new Error("Invalid or expired verification token.");
    }

    if (new Date() > record.expiresAt) {
      store.verificationTokens.delete(token);
      throw new Error("Verification token has expired. Please request a new link.");
    }

    const user = store.users.get(record.email);
    if (!user) {
      throw new Error("Associated user account not found.");
    }

    user.emailVerified = true;
    store.users.set(user.email, user);
    store.verificationTokens.delete(token); // Single-use

    return user;
  },

  /**
   * Generates a password reset token without revealing if account exists (Anti-enumeration).
   */
  async requestPasswordReset(email: string): Promise<{ token?: string }> {
    const normalized = email.toLowerCase().trim();
    const user = store.users.get(normalized);

    // Always succeed publicly to prevent email enumeration
    if (!user) {
      return {};
    }

    const token = crypto.randomBytes(32).toString("hex");
    store.resetTokens.set(token, {
      token,
      email: normalized,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiry
    });

    return { token };
  },

  /**
   * Resets password using valid token and invalidates active sessions.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const record = store.resetTokens.get(token);
    if (!record) {
      throw new Error("Invalid or expired password reset token.");
    }

    if (new Date() > record.expiresAt) {
      store.resetTokens.delete(token);
      throw new Error("Reset token has expired. Please submit a new request.");
    }

    const user = store.users.get(record.email);
    if (!user) {
      throw new Error("User not found.");
    }

    user.passwordHash = await hashPassword(newPassword);
    store.users.set(user.email, user);
    store.resetTokens.delete(token); // Invalidate token

    // Invalidate existing sessions for security
    await this.logoutAllDevices(user.id);
  },

  /**
   * Invalidates a single session.
   */
  async logout(sessionId: string): Promise<void> {
    store.sessions.delete(sessionId);
  },

  /**
   * Invalidates all sessions across all devices for a user.
   */
  async logoutAllDevices(userId: string): Promise<void> {
    for (const [key, session] of store.sessions.entries()) {
      if (session.userId === userId) {
        store.sessions.delete(key);
      }
    }
  },

  /**
   * Fetches user by ID.
   */
  async getUserById(userId: string): Promise<StoredUser | null> {
    for (const user of store.users.values()) {
      if (user.id === userId) return user;
    }
    return null;
  },

  /**
   * Fetches user by Email.
   */
  async getUserByEmail(email: string): Promise<StoredUser | null> {
    return store.users.get(email.toLowerCase().trim()) || null;
  },
};
