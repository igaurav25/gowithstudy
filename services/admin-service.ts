import { prisma } from "@/lib/prisma";
import { Role, assertRole } from "@/lib/rbac";
import {
  UpdateUserRoleInput,
  ToggleUserStatusInput,
  ResolveReportInput,
  CreateAnnouncementInput,
  AdminUserFilterInput,
  AnnouncementCategory,
  AnnouncementPriority,
  ReportActionTaken,
} from "@/schemas/admin";

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  college: string;
  course: string;
  branch: string;
  year: number;
  semester: number;
  isSuspended: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface ModerationReportItem {
  id: string;
  reporterId: string;
  reporterName: string;
  entityType: "POST" | "COMMENT" | "PROJECT" | "NOTE" | "USER";
  entityId: string;
  entityTitle: string;
  entitySnippet: string;
  reason: string;
  description: string | null;
  status: "OPEN" | "REVIEWING" | "RESOLVED" | "REJECTED";
  resolutionNote: string | null;
  actionTaken: ReportActionTaken | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementItem {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  isPinned: boolean;
  isActive: boolean;
  targetAudience: string;
  expiresAt: string | null;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  userId: string | null;
  userName: string;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
}

export interface AdminOverviewStats {
  totalUsers: number;
  activeUsers30d: number;
  moderationQueueCount: number;
  totalPosts: number;
  totalProjects: number;
  totalNotes: number;
  branchBreakdown: { branch: string; count: number; percentage: number }[];
  roleBreakdown: { role: string; count: number }[];
}

// In-Memory state for environments without PostgreSQL connection
let inMemoryUsers: AdminUserItem[] = [];
let inMemoryReports: ModerationReportItem[] = [];
let inMemoryAnnouncements: AnnouncementItem[] = [];
let inMemoryAuditLogs: AuditLogItem[] = [];
let isInitialized = false;

function initializeDemoAdminData() {
  if (isInitialized && inMemoryUsers.length > 0) return;

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();

  inMemoryUsers = [
    {
      id: "usr_admin_01",
      name: "Dr. Vikram Sethi",
      email: "admin@campusflow.edu",
      role: "ADMIN",
      college: "Delhi Technological University",
      course: "Faculty / Dean",
      branch: "Computer Science & Engineering",
      year: 4,
      semester: 8,
      isSuspended: false,
      emailVerified: true,
      createdAt: daysAgo(120),
    },
    {
      id: "usr_mod_01",
      name: "Priya Nair",
      email: "moderator@campusflow.edu",
      role: "MODERATOR",
      college: "IIT Bombay",
      course: "B.Tech",
      branch: "Information Technology",
      year: 4,
      semester: 8,
      isSuspended: false,
      emailVerified: true,
      createdAt: daysAgo(90),
    },
    {
      id: "usr_student_01",
      name: "Aarav Sharma",
      email: "student@campusflow.edu",
      role: "USER",
      college: "Delhi Technological University",
      course: "B.Tech",
      branch: "Computer Science & Engineering",
      year: 3,
      semester: 6,
      isSuspended: false,
      emailVerified: true,
      createdAt: daysAgo(60),
    },
    {
      id: "usr_student_02",
      name: "Ananya Deshmukh",
      email: "ananya.d@campusflow.edu",
      role: "USER",
      college: "BITS Pilani",
      course: "B.E.",
      branch: "Computer Science",
      year: 3,
      semester: 5,
      isSuspended: false,
      emailVerified: true,
      createdAt: daysAgo(45),
    },
    {
      id: "usr_student_03",
      name: "Rohan Verma",
      email: "rohan.v@campusflow.edu",
      role: "USER",
      college: "Delhi Technological University",
      course: "B.Tech",
      branch: "Electronics & Communication",
      year: 2,
      semester: 4,
      isSuspended: false,
      emailVerified: true,
      createdAt: daysAgo(30),
    },
    {
      id: "usr_student_04",
      name: "Kavya Menon",
      email: "kavya.menon@campusflow.edu",
      role: "MODERATOR",
      college: "NIT Trichy",
      course: "B.Tech",
      branch: "Computer Science",
      year: 4,
      semester: 7,
      isSuspended: false,
      emailVerified: true,
      createdAt: daysAgo(40),
    },
    {
      id: "usr_student_05",
      name: "Siddharth Rao",
      email: "sid.rao@campusflow.edu",
      role: "USER",
      college: "IIIT Hyderabad",
      course: "B.Tech",
      branch: "Computer Science",
      year: 3,
      semester: 6,
      isSuspended: true, // Example suspended user
      emailVerified: true,
      createdAt: daysAgo(25),
    },
    {
      id: "usr_student_06",
      name: "Sneha Reddy",
      email: "sneha.reddy@campusflow.edu",
      role: "USER",
      college: "DTU Delhi",
      course: "B.Tech",
      branch: "Artificial Intelligence & ML",
      year: 2,
      semester: 3,
      isSuspended: false,
      emailVerified: true,
      createdAt: daysAgo(10),
    },
  ];

  inMemoryReports = [
    {
      id: "rep_1",
      reporterId: "usr_student_01",
      reporterName: "Aarav Sharma",
      entityType: "POST",
      entityId: "post_spam_99",
      entityTitle: "Join Paid Telegram Group for Mid-Sem Exam Leaks",
      entitySnippet: "Join our private Telegram t.me/exam_hacks for leaked papers and instant solved keys...",
      reason: "SPAM",
      description: "External paid Telegram promotion violating academic integrity guidelines.",
      status: "OPEN",
      resolutionNote: null,
      actionTaken: null,
      createdAt: hoursAgo(3),
      updatedAt: hoursAgo(3),
    },
    {
      id: "rep_2",
      reporterId: "usr_student_02",
      reporterName: "Ananya Deshmukh",
      entityType: "COMMENT",
      entityId: "comm_harass_42",
      entityTitle: "Comment on 'Operating Systems Virtual Memory Doubt'",
      entitySnippet: "You don't even know TLB basic math, you should drop out of engineering...",
      reason: "HARASSMENT",
      description: "Hostile and toxic remark attacking a 1st-year student asking a conceptual query.",
      status: "OPEN",
      resolutionNote: null,
      actionTaken: null,
      createdAt: hoursAgo(6),
      updatedAt: hoursAgo(6),
    },
    {
      id: "rep_3",
      reporterId: "usr_student_03",
      reporterName: "Rohan Verma",
      entityType: "PROJECT",
      entityId: "proj_crypto_scam",
      entityTitle: "Decentralized High Yield Crypto Staking Campus Project",
      entitySnippet: "Looking for 3 devs. Must invest 500 USDT in smart contract testnet seed pool...",
      reason: "INAPPROPRIATE",
      description: "Financial investment scheme disguised as a college hackathon project listing.",
      status: "OPEN",
      resolutionNote: null,
      actionTaken: null,
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
    {
      id: "rep_4",
      reporterId: "usr_mod_01",
      reporterName: "Priya Nair",
      entityType: "NOTE",
      entityId: "note_copy_12",
      entityTitle: "Full McGraw Hill Textbook PDF Scan (Unauthorized)",
      entitySnippet: "Complete scanned copy of Tanenbaum Computer Networks 6th edition with DRM removed...",
      reason: "PLAGIARISM",
      description: "Copyrighted textbook PDF distribution without publisher authorization.",
      status: "RESOLVED",
      resolutionNote: "Note removed from public feed and author issued academic copyright advisory.",
      actionTaken: "DELETE_CONTENT",
      createdAt: daysAgo(3),
      updatedAt: daysAgo(2),
    },
  ];

  inMemoryAnnouncements = [
    {
      id: "ann_1",
      authorId: "usr_admin_01",
      authorName: "Dr. Vikram Sethi",
      title: "TCS CodeVita Season 14 & Campus OA Registration",
      content: "All eligible 3rd and 4th year B.Tech students must verify their placement portal profiles by Friday 5:00 PM. Mock coding round starts this Sunday on HackerEarth.",
      category: "PLACEMENT",
      priority: "HIGH",
      isPinned: true,
      isActive: true,
      targetAudience: "STUDENTS",
      expiresAt: daysAgo(-7),
      createdAt: hoursAgo(10),
    },
    {
      id: "ann_2",
      authorId: "usr_admin_01",
      authorName: "Dr. Vikram Sethi",
      title: "Campus Cloud Lab Server Maintenance Scheduled",
      content: "The CS Department high-performance cluster and Docker GPU nodes will undergo kernel updates on Saturday from 2:00 AM to 6:00 AM. Cloud sessions will be temporarily suspended.",
      category: "MAINTENANCE",
      priority: "MEDIUM",
      isPinned: false,
      isActive: true,
      targetAudience: "ALL",
      expiresAt: daysAgo(-3),
      createdAt: daysAgo(1),
    },
    {
      id: "ann_3",
      authorId: "usr_mod_01",
      authorName: "Priya Nair",
      title: "End-Semester Practical Exam Guidelines & Git Submissions",
      content: "Standard operating guidelines for Compiler Design, Database Management Systems, and Computer Networks laboratory practical assessments have been uploaded.",
      category: "ACADEMIC",
      priority: "MEDIUM",
      isPinned: true,
      isActive: true,
      targetAudience: "STUDENTS",
      expiresAt: daysAgo(-14),
      createdAt: daysAgo(3),
    },
  ];

  inMemoryAuditLogs = [
    {
      id: "aud_1",
      userId: "usr_admin_01",
      userName: "Dr. Vikram Sethi",
      action: "ANNOUNCEMENT_CREATED",
      entity: "ANNOUNCEMENT",
      entityId: "ann_1",
      metadata: { title: "TCS CodeVita Season 14", priority: "HIGH" },
      createdAt: hoursAgo(10),
    },
    {
      id: "aud_2",
      userId: "usr_mod_01",
      userName: "Priya Nair",
      action: "REPORT_RESOLVED",
      entity: "CONTENT_REPORT",
      entityId: "rep_4",
      metadata: { actionTaken: "DELETE_CONTENT", entityType: "NOTE" },
      createdAt: daysAgo(2),
    },
    {
      id: "aud_3",
      userId: "usr_admin_01",
      userName: "Dr. Vikram Sethi",
      action: "USER_SUSPENDED",
      entity: "USER",
      entityId: "usr_student_05",
      metadata: { reason: "Repeated spam posting in general forum" },
      createdAt: daysAgo(4),
    },
    {
      id: "aud_4",
      userId: "usr_admin_01",
      userName: "Dr. Vikram Sethi",
      action: "USER_ROLE_PROMOTED",
      entity: "USER",
      entityId: "usr_student_04",
      metadata: { previousRole: "USER", newRole: "MODERATOR" },
      createdAt: daysAgo(7),
    },
    {
      id: "aud_5",
      userId: "usr_mod_01",
      userName: "Priya Nair",
      action: "COMMUNITY_POST_PINNED",
      entity: "POST",
      entityId: "post_sih_1",
      metadata: { category: "PROJECTS" },
      createdAt: daysAgo(10),
    },
  ];

  isInitialized = true;
}

export const AdminService = {
  /**
   * Log an immutable administrative audit action
   */
  async logAuditEvent(
    userId: string,
    action: string,
    entity: string,
    entityId: string | null = null,
    metadata: Record<string, any> | null = null
  ) {
    initializeDemoAdminData();

    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          entity,
          entityId,
          metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
        },
      });
      return;
    } catch {
      // In-memory fallback
    }

    const user = inMemoryUsers.find((u) => u.id === userId);
    inMemoryAuditLogs.unshift({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      userName: user?.name || "Admin Officer",
      action,
      entity,
      entityId,
      metadata,
      createdAt: new Date().toISOString(),
    });
  },

  /**
   * Get high-level Admin Overview statistics & breakdowns
   */
  async getAdminOverview(adminUserId: string): Promise<AdminOverviewStats> {
    initializeDemoAdminData();

    const users = await this.getUsers(adminUserId);
    const reports = await this.getModerationQueue(adminUserId, "OPEN");

    // Calculate branch breakdown
    const branchMap = new Map<string, number>();
    users.forEach((u) => {
      const b = u.branch || "General";
      branchMap.set(b, (branchMap.get(b) || 0) + 1);
    });

    const branchBreakdown = Array.from(branchMap.entries()).map(([branch, count]) => ({
      branch,
      count,
      percentage: Math.round((count / Math.max(1, users.length)) * 100),
    }));

    // Calculate role breakdown
    const roleMap = new Map<string, number>();
    users.forEach((u) => {
      roleMap.set(u.role, (roleMap.get(u.role) || 0) + 1);
    });

    const roleBreakdown = Array.from(roleMap.entries()).map(([role, count]) => ({
      role,
      count,
    }));

    return {
      totalUsers: users.length,
      activeUsers30d: Math.round(users.length * 0.85),
      moderationQueueCount: reports.length,
      totalPosts: 38,
      totalProjects: 12,
      totalNotes: 24,
      branchBreakdown,
      roleBreakdown,
    };
  },

  /**
   * Get list of registered users with search and filtering
   */
  async getUsers(
    adminUserId: string,
    filter?: AdminUserFilterInput
  ): Promise<AdminUserItem[]> {
    initializeDemoAdminData();

    try {
      const where: any = {};
      if (filter?.role && filter.role !== "ALL") {
        where.role = filter.role;
      }
      if (filter?.status === "SUSPENDED") {
        where.isSuspended = true;
      } else if (filter?.status === "ACTIVE") {
        where.isSuspended = false;
      }

      if (filter?.query && filter.query.trim()) {
        const q = filter.query.trim();
        where.OR = [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { branch: { contains: q, mode: "insensitive" } },
          { college: { contains: q, mode: "insensitive" } },
        ];
      }

      const dbUsers = await prisma.user.findMany({
        where,
        include: { profile: true },
        orderBy: { createdAt: "desc" },
      });

      if (dbUsers && dbUsers.length > 0) {
        return dbUsers.map((u) => ({
          id: u.id,
          name: u.profile?.name || u.email.split("@")[0],
          email: u.email,
          role: u.role as Role,
          college: u.profile?.college || "CampusFlow University",
          course: u.profile?.course || "B.Tech",
          branch: u.profile?.branch || "Computer Science",
          year: u.profile?.year || 1,
          semester: u.profile?.semester || 1,
          isSuspended: u.isSuspended,
          emailVerified: u.emailVerified,
          createdAt: u.createdAt.toISOString(),
        }));
      }
    } catch {
      // In-memory fallback
    }

    let list = [...inMemoryUsers];

    if (filter?.role && filter.role !== "ALL") {
      list = list.filter((u) => u.role === filter.role);
    }
    if (filter?.status === "SUSPENDED") {
      list = list.filter((u) => u.isSuspended);
    } else if (filter?.status === "ACTIVE") {
      list = list.filter((u) => !u.isSuspended);
    }

    if (filter?.query && filter.query.trim()) {
      const q = filter.query.toLowerCase().trim();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.branch.toLowerCase().includes(q) ||
          u.college.toLowerCase().includes(q)
      );
    }

    return list;
  },

  /**
   * Update role for a user (Promote / Demote)
   */
  async updateUserRole(
    adminUserId: string,
    targetUserId: string,
    newRole: Role,
    reason: string
  ): Promise<AdminUserItem> {
    initializeDemoAdminData();

    try {
      const updated = await prisma.user.update({
        where: { id: targetUserId },
        data: { role: newRole },
        include: { profile: true },
      });

      await this.logAuditEvent(
        adminUserId,
        `USER_ROLE_UPDATED_TO_${newRole}`,
        "USER",
        targetUserId,
        { previousRole: updated.role, newRole, reason }
      );

      return {
        id: updated.id,
        name: updated.profile?.name || updated.email.split("@")[0],
        email: updated.email,
        role: updated.role as Role,
        college: updated.profile?.college || "CampusFlow University",
        course: updated.profile?.course || "B.Tech",
        branch: updated.profile?.branch || "Computer Science",
        year: updated.profile?.year || 1,
        semester: updated.profile?.semester || 1,
        isSuspended: updated.isSuspended,
        emailVerified: updated.emailVerified,
        createdAt: updated.createdAt.toISOString(),
      };
    } catch {
      // In-memory fallback
    }

    const user = inMemoryUsers.find((u) => u.id === targetUserId);
    if (!user) {
      throw new Error("Target student account not found");
    }

    const oldRole = user.role;
    user.role = newRole;

    await this.logAuditEvent(
      adminUserId,
      `USER_ROLE_UPDATED_TO_${newRole}`,
      "USER",
      targetUserId,
      { previousRole: oldRole, newRole, reason }
    );

    return user;
  },

  /**
   * Toggle suspension status of a user
   */
  async toggleUserSuspension(
    adminUserId: string,
    targetUserId: string,
    isSuspended: boolean,
    reason: string
  ): Promise<AdminUserItem> {
    initializeDemoAdminData();

    try {
      const updated = await prisma.user.update({
        where: { id: targetUserId },
        data: { isSuspended },
        include: { profile: true },
      });

      await this.logAuditEvent(
        adminUserId,
        isSuspended ? "USER_SUSPENDED" : "USER_REINSTATED",
        "USER",
        targetUserId,
        { reason }
      );

      return {
        id: updated.id,
        name: updated.profile?.name || updated.email.split("@")[0],
        email: updated.email,
        role: updated.role as Role,
        college: updated.profile?.college || "CampusFlow University",
        course: updated.profile?.course || "B.Tech",
        branch: updated.profile?.branch || "Computer Science",
        year: updated.profile?.year || 1,
        semester: updated.profile?.semester || 1,
        isSuspended: updated.isSuspended,
        emailVerified: updated.emailVerified,
        createdAt: updated.createdAt.toISOString(),
      };
    } catch {
      // In-memory fallback
    }

    const user = inMemoryUsers.find((u) => u.id === targetUserId);
    if (!user) {
      throw new Error("Target student account not found");
    }

    user.isSuspended = isSuspended;

    await this.logAuditEvent(
      adminUserId,
      isSuspended ? "USER_SUSPENDED" : "USER_REINSTATED",
      "USER",
      targetUserId,
      { reason }
    );

    return user;
  },

  /**
   * Get moderation queue
   */
  async getModerationQueue(
    adminUserId: string,
    status?: string
  ): Promise<ModerationReportItem[]> {
    initializeDemoAdminData();

    try {
      const where: any = {};
      if (status && status !== "ALL") {
        where.status = status;
      }

      const dbReports = await prisma.contentReport.findMany({
        where,
        include: { reporter: { include: { profile: true } } },
        orderBy: { createdAt: "desc" },
      });

      if (dbReports && dbReports.length > 0) {
        return dbReports.map((r) => ({
          id: r.id,
          reporterId: r.reporterId,
          reporterName: r.reporter.profile?.name || r.reporter.email.split("@")[0],
          entityType: r.entityType as any,
          entityId: r.entityId,
          entityTitle: `Flagged ${r.entityType}`,
          entitySnippet: r.description || "Content flagged by student reporter",
          reason: r.reason,
          description: r.description,
          status: r.status as any,
          resolutionNote: null,
          actionTaken: null,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        }));
      }
    } catch {
      // In-memory fallback
    }

    let list = [...inMemoryReports];
    if (status && status !== "ALL") {
      list = list.filter((r) => r.status === status);
    }
    return list;
  },

  /**
   * Resolve a flagged content report
   */
  async resolveReport(
    adminUserId: string,
    input: ResolveReportInput
  ): Promise<ModerationReportItem> {
    initializeDemoAdminData();

    try {
      const updated = await prisma.contentReport.update({
        where: { id: input.reportId },
        data: {
          status: input.status,
        },
      });

      await this.logAuditEvent(
        adminUserId,
        `REPORT_${input.status}`,
        "CONTENT_REPORT",
        input.reportId,
        { actionTaken: input.actionTaken, resolutionNote: input.resolutionNote }
      );

      const existing = inMemoryReports.find((r) => r.id === input.reportId);
      if (existing) {
        existing.status = input.status;
        existing.actionTaken = input.actionTaken;
        existing.resolutionNote = input.resolutionNote;
        existing.updatedAt = new Date().toISOString();
        return existing;
      }
    } catch {
      // In-memory fallback
    }

    const report = inMemoryReports.find((r) => r.id === input.reportId);
    if (!report) {
      throw new Error("Report not found in moderation queue");
    }

    report.status = input.status;
    report.actionTaken = input.actionTaken;
    report.resolutionNote = input.resolutionNote;
    report.updatedAt = new Date().toISOString();

    await this.logAuditEvent(
      adminUserId,
      `REPORT_${input.status}`,
      "CONTENT_REPORT",
      input.reportId,
      { actionTaken: input.actionTaken, resolutionNote: input.resolutionNote }
    );

    return report;
  },

  /**
   * Get system announcements
   */
  async getAnnouncements(adminUserId: string): Promise<AnnouncementItem[]> {
    initializeDemoAdminData();

    try {
      const dbAnnouncements = await prisma.systemAnnouncement.findMany({
        include: { author: { include: { profile: true } } },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      });

      if (dbAnnouncements && dbAnnouncements.length > 0) {
        return dbAnnouncements.map((a) => ({
          id: a.id,
          authorId: a.authorId,
          authorName: a.author.profile?.name || a.author.email.split("@")[0],
          title: a.title,
          content: a.content,
          category: a.category as AnnouncementCategory,
          priority: a.priority as AnnouncementPriority,
          isPinned: a.isPinned,
          isActive: a.isActive,
          targetAudience: a.targetAudience,
          expiresAt: a.expiresAt ? a.expiresAt.toISOString() : null,
          createdAt: a.createdAt.toISOString(),
        }));
      }
    } catch {
      // In-memory fallback
    }

    return [...inMemoryAnnouncements].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },

  /**
   * Create a new campus announcement
   */
  async createAnnouncement(
    adminUserId: string,
    authorName: string,
    input: CreateAnnouncementInput
  ): Promise<AnnouncementItem> {
    initializeDemoAdminData();

    try {
      const created = await prisma.systemAnnouncement.create({
        data: {
          authorId: adminUserId,
          title: input.title,
          content: input.content,
          category: input.category,
          priority: input.priority,
          isPinned: input.isPinned,
          targetAudience: input.targetAudience,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        },
      });

      await this.logAuditEvent(
        adminUserId,
        "ANNOUNCEMENT_CREATED",
        "ANNOUNCEMENT",
        created.id,
        { title: input.title, category: input.category }
      );

      return {
        id: created.id,
        authorId: created.authorId,
        authorName,
        title: created.title,
        content: created.content,
        category: created.category as AnnouncementCategory,
        priority: created.priority as AnnouncementPriority,
        isPinned: created.isPinned,
        isActive: created.isActive,
        targetAudience: created.targetAudience,
        expiresAt: created.expiresAt ? created.expiresAt.toISOString() : null,
        createdAt: created.createdAt.toISOString(),
      };
    } catch {
      // In-memory fallback
    }

    const newAnnouncement: AnnouncementItem = {
      id: `ann_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      authorId: adminUserId,
      authorName,
      title: input.title,
      content: input.content,
      category: input.category,
      priority: input.priority,
      isPinned: input.isPinned,
      isActive: true,
      targetAudience: input.targetAudience,
      expiresAt: input.expiresAt || null,
      createdAt: new Date().toISOString(),
    };

    inMemoryAnnouncements.unshift(newAnnouncement);

    await this.logAuditEvent(
      adminUserId,
      "ANNOUNCEMENT_CREATED",
      "ANNOUNCEMENT",
      newAnnouncement.id,
      { title: input.title, category: input.category }
    );

    return newAnnouncement;
  },

  /**
   * Delete an announcement
   */
  async deleteAnnouncement(
    adminUserId: string,
    announcementId: string
  ): Promise<boolean> {
    initializeDemoAdminData();

    try {
      await prisma.systemAnnouncement.delete({
        where: { id: announcementId },
      });

      await this.logAuditEvent(
        adminUserId,
        "ANNOUNCEMENT_DELETED",
        "ANNOUNCEMENT",
        announcementId
      );

      return true;
    } catch {
      // In-memory fallback
    }

    const idx = inMemoryAnnouncements.findIndex((a) => a.id === announcementId);
    if (idx !== -1) {
      inMemoryAnnouncements.splice(idx, 1);
      await this.logAuditEvent(
        adminUserId,
        "ANNOUNCEMENT_DELETED",
        "ANNOUNCEMENT",
        announcementId
      );
      return true;
    }

    return false;
  },

  /**
   * Get immutable audit log feed
   */
  async getAuditLogs(
    adminUserId: string,
    limit: number = 20
  ): Promise<AuditLogItem[]> {
    initializeDemoAdminData();

    try {
      const logs = await prisma.auditLog.findMany({
        include: { user: { include: { profile: true } } },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      if (logs && logs.length > 0) {
        return logs.map((l) => ({
          id: l.id,
          userId: l.userId,
          userName: l.user?.profile?.name || l.user?.email.split("@")[0] || "System Action",
          action: l.action,
          entity: l.entity,
          entityId: l.entityId,
          metadata: l.metadata as any,
          createdAt: l.createdAt.toISOString(),
        }));
      }
    } catch {
      // In-memory fallback
    }

    return [...inMemoryAuditLogs].slice(0, limit);
  },
};
