import { hashPassword, comparePassword } from "@/lib/auth";
import { Role } from "@/lib/rbac";
import { SignupInput, LoginInput } from "@/schemas/auth";
import { prisma } from "@/lib/prisma";
import { isDbConnected } from "@/lib/db-check";
import crypto from "crypto";
import fs from "fs";
import path from "path";

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

// Persistent state across requests, reloads, mobile & desktop sessions
class AuthStore {
  public users: Map<string, StoredUser> = new Map();
  public verificationTokens: Map<string, VerificationToken> = new Map();
  public resetTokens: Map<string, PasswordResetToken> = new Map();
  public sessions: Map<string, ActiveSession> = new Map();
  private initialized = false;
  private diskFilePath = path.join(process.cwd(), ".data", "auth-users.json");

  constructor() {
    this.initDefaultUsers();
  }

  private loadUsersFromDisk(): void {
    try {
      if (fs.existsSync(this.diskFilePath)) {
        const raw = fs.readFileSync(this.diskFilePath, "utf8");
        const list = JSON.parse(raw) as StoredUser[];
        if (Array.isArray(list)) {
          for (const u of list) {
            this.users.set(u.email.toLowerCase(), {
              ...u,
              createdAt: new Date(u.createdAt),
            });
          }
        }
      }
    } catch (e) {
      console.warn("Failed to load users from persistent disk store:", e);
    }
  }

  public saveUsersToDisk(): void {
    try {
      const dir = path.dirname(this.diskFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const list = Array.from(this.users.values());
      fs.writeFileSync(this.diskFilePath, JSON.stringify(list, null, 2), "utf8");
    } catch (e) {
      console.warn("Failed to persist users to disk store:", e);
    }
  }

  public loadUserFromDisk(email: string): StoredUser | null {
    try {
      if (fs.existsSync(this.diskFilePath)) {
        const raw = fs.readFileSync(this.diskFilePath, "utf8");
        const list = JSON.parse(raw) as StoredUser[];
        const found = list.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (found) {
          return {
            ...found,
            createdAt: new Date(found.createdAt),
          };
        }
      }
    } catch {
      // fallback silently
    }
    return null;
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

    // Load any previously registered student accounts (Gmail, college accounts)
    this.loadUsersFromDisk();
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
   * Registers a new student account and persists across server reloads and devices.
   */
  async signup(input: SignupInput): Promise<{ user: StoredUser; verificationToken: string }> {
    const existing = await this.getUserByEmail(input.email);
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
    store.saveUsersToDisk();

    // Persist to database if connected
    try {
      if (await isDbConnected()) {
        await prisma.user.create({
          data: {
            id: newUser.id,
            email: newUser.email,
            passwordHash: newUser.passwordHash,
            role: newUser.role,
            emailVerified: false,
            profile: {
              create: {
                name: newUser.name,
                college: newUser.college,
                course: newUser.course,
                branch: newUser.branch,
                year: newUser.year,
                semester: newUser.semester,
              },
            },
          },
        });
      }
    } catch (dbErr) {
      console.warn("Prisma user signup sync fallback:", dbErr);
    }

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
   * Authenticates or auto-provisions a student via Google / Gmail.
   * Ensures that once someone signs in with Gmail, their account and session remain permanently saved,
   * so they never need to repeatedly fill out the signup/registration form again.
   */
  async googleAuth(input: {
    email: string;
    name?: string;
    avatarUrl?: string;
  }): Promise<{ user: StoredUser; sessionId: string; isNewUser: boolean }> {
    const email = input.email.toLowerCase().trim();
    if (!email || !email.includes("@")) {
      throw new Error("A valid email or Gmail address is required.");
    }

    let user = await this.getUserByEmail(email);
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const defaultPasswordHash = await hashPassword(crypto.randomBytes(16).toString("hex"));
      const userId = `usr_${crypto.randomBytes(8).toString("hex")}`;

      const derivedName =
        input.name?.trim() ||
        email
          .split("@")[0]
          .replace(/[._]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

      user = {
        id: userId,
        name: derivedName,
        email,
        passwordHash: defaultPasswordHash,
        role: "USER",
        college: "CampusFlow University",
        course: "B.Tech",
        branch: "Computer Science & Engineering",
        year: 1,
        semester: 1,
        emailVerified: true,
        avatarUrl:
          input.avatarUrl ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(derivedName)}`,
        createdAt: new Date(),
      };

      store.users.set(email, user);
      store.saveUsersToDisk();

      // Database sync
      try {
        if (await isDbConnected()) {
          await prisma.user.create({
            data: {
              id: user.id,
              email: user.email,
              passwordHash: user.passwordHash,
              role: user.role,
              emailVerified: true,
              profile: {
                create: {
                  name: user.name,
                  avatarUrl: user.avatarUrl,
                  college: user.college,
                  course: user.course,
                  branch: user.branch,
                  year: user.year,
                  semester: user.semester,
                },
              },
            },
          });
        }
      } catch (dbErr) {
        console.warn("Prisma googleAuth user sync fallback:", dbErr);
      }
    }

    const sessionId = `ses_${crypto.randomBytes(16).toString("hex")}`;
    store.sessions.set(sessionId, {
      id: sessionId,
      userId: user.id,
      createdAt: new Date(),
    });

    return { user, sessionId, isNewUser };
  },

  /**
   * Authenticates user with credentials and creates a session.
   */
  async login(input: LoginInput): Promise<{ user: StoredUser; sessionId: string }> {
    const user = await this.getUserByEmail(input.email);
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

    const user = await this.getUserByEmail(record.email);
    if (!user) {
      throw new Error("Associated user account not found.");
    }

    user.emailVerified = true;
    store.users.set(user.email, user);
    store.saveUsersToDisk();
    store.verificationTokens.delete(token); // Single-use

    try {
      if (await isDbConnected()) {
        await prisma.user.updateMany({
          where: { email: user.email },
          data: { emailVerified: true },
        });
      }
    } catch {
      // fallback silently
    }

    return user;
  },

  /**
   * Generates a password reset token without revealing if account exists (Anti-enumeration).
   */
  async requestPasswordReset(email: string): Promise<{ token?: string }> {
    const normalized = email.toLowerCase().trim();
    const user = await this.getUserByEmail(normalized);

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

    const user = await this.getUserByEmail(record.email);
    if (!user) {
      throw new Error("User not found.");
    }

    user.passwordHash = await hashPassword(newPassword);
    store.users.set(user.email, user);
    store.saveUsersToDisk();
    store.resetTokens.delete(token); // Invalidate token

    try {
      if (await isDbConnected()) {
        await prisma.user.updateMany({
          where: { email: user.email },
          data: { passwordHash: user.passwordHash },
        });
      }
    } catch {
      // fallback silently
    }

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
   * Fetches user by ID, checking memory cache, persistent disk storage, and PostgreSQL.
   */
  async getUserById(userId: string): Promise<StoredUser | null> {
    // 1. Check in-memory map
    for (const user of store.users.values()) {
      if (user.id === userId) return user;
    }

    // 2. Check Database if connected
    try {
      if (await isDbConnected()) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          include: { profile: true },
        });
        if (dbUser) {
          const user: StoredUser = {
            id: dbUser.id,
            name: dbUser.profile?.name || dbUser.email.split("@")[0],
            email: dbUser.email,
            passwordHash: dbUser.passwordHash,
            role: dbUser.role as Role,
            college: dbUser.profile?.college || "CampusFlow University",
            course: dbUser.profile?.course || "B.Tech",
            branch: dbUser.profile?.branch || "Computer Science & Engineering",
            year: dbUser.profile?.year || 1,
            semester: dbUser.profile?.semester || 1,
            emailVerified: dbUser.emailVerified,
            avatarUrl: dbUser.profile?.avatarUrl ?? undefined,
            createdAt: dbUser.createdAt,
          };
          store.users.set(user.email.toLowerCase(), user);
          store.saveUsersToDisk();
          return user;
        }
      }
    } catch (e) {
      console.warn("DB user lookup error:", e);
    }

    return null;
  },

  /**
   * Fetches user by Email, checking memory cache, persistent disk storage, and PostgreSQL.
   */
  async getUserByEmail(email: string): Promise<StoredUser | null> {
    const normalized = email.toLowerCase().trim();

    // 1. Check in-memory map
    const cached = store.users.get(normalized);
    if (cached) return cached;

    // 2. Check persistent disk file (survives dev server reloads)
    const diskUser = store.loadUserFromDisk(normalized);
    if (diskUser) {
      store.users.set(normalized, diskUser);
      return diskUser;
    }

    // 3. Check Database if connected
    try {
      if (await isDbConnected()) {
        const dbUser = await prisma.user.findUnique({
          where: { email: normalized },
          include: { profile: true },
        });
        if (dbUser) {
          const user: StoredUser = {
            id: dbUser.id,
            name: dbUser.profile?.name || dbUser.email.split("@")[0],
            email: dbUser.email,
            passwordHash: dbUser.passwordHash,
            role: dbUser.role as Role,
            college: dbUser.profile?.college || "CampusFlow University",
            course: dbUser.profile?.course || "B.Tech",
            branch: dbUser.profile?.branch || "Computer Science & Engineering",
            year: dbUser.profile?.year || 1,
            semester: dbUser.profile?.semester || 1,
            emailVerified: dbUser.emailVerified,
            avatarUrl: dbUser.profile?.avatarUrl ?? undefined,
            createdAt: dbUser.createdAt,
          };
          store.users.set(normalized, user);
          store.saveUsersToDisk();
          return user;
        }
      }
    } catch (e) {
      console.warn("DB user lookup error:", e);
    }

    return null;
  },
};
