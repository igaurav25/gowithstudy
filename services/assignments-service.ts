import { prisma } from "@/lib/prisma";
import {
  AssignmentPriority,
  AssignmentStatus,
  CreateAssignmentInput,
  UpdateAssignmentInput,
  AssignmentsFilterInput,
} from "@/schemas/assignments";

export interface AssignmentItem {
  id: string;
  userId: string;
  title: string;
  subject: string;
  description: string | null;
  dueDate: Date;
  priority: AssignmentPriority;
  status: AssignmentStatus;
  attachmentUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  dueDays: number;
  dueLabel: string;
}

export interface AssignmentsStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  completionRate: number;
}

// In-memory fallback assignment store
const mockAssignmentsStore = new Map<string, AssignmentItem[]>();

function calculateDueDetails(dueDate: Date): { dueDays: number; dueLabel: string } {
  const now = new Date();
  const diffTime = dueDate.getTime() - now.getTime();
  const dueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let dueLabel = "";
  if (dueDays < 0) {
    const daysAgo = Math.abs(dueDays);
    dueLabel = `Overdue by ${daysAgo} ${daysAgo === 1 ? "day" : "days"}`;
  } else if (dueDays === 0) {
    dueLabel = "Due today at 11:59 PM";
  } else if (dueDays === 1) {
    dueLabel = "Due tomorrow at 11:59 PM";
  } else {
    dueLabel = `Due in ${dueDays} days`;
  }

  return { dueDays, dueLabel };
}

function getInitialDemoAssignments(userId: string): AssignmentItem[] {
  const now = new Date();

  const dueTomorrow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  const dueIn3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const dueIn5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const dueIn7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const dueIn10Days = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

  return [
    {
      id: "asgn_dbms_1",
      userId,
      title: "DBMS B+ Tree Implementation Report & Query Optimization",
      subject: "Database Management Systems",
      description: "Implement node splitting/merging in Java and submit benchmark report comparing index scans vs table scans.",
      dueDate: dueTomorrow,
      priority: "URGENT",
      status: "PENDING",
      attachmentUrl: "/sample-notes/dbms-bcnf.pdf",
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      ...calculateDueDetails(dueTomorrow),
    },
    {
      id: "asgn_os_2",
      userId,
      title: "Operating Systems — Process Scheduling Simulation",
      subject: "Operating Systems",
      description: "Build a C++ simulator comparing FCFS, SJF, and Round Robin with average turnaround & waiting time metrics.",
      dueDate: dueIn3Days,
      priority: "HIGH",
      status: "IN_PROGRESS",
      attachmentUrl: "/sample-notes/os-scheduling.pdf",
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      ...calculateDueDetails(dueIn3Days),
    },
    {
      id: "asgn_cn_3",
      userId,
      title: "TCP Congestion Control Simulation using ns-3",
      subject: "Computer Networks",
      description: "Simulate TCP Reno vs TCP Cubic over a bottleneck link with 2% packet loss and plot cwnd graph.",
      dueDate: dueIn5Days,
      priority: "MEDIUM",
      status: "COMPLETED",
      attachmentUrl: "/sample-notes/cn-subnetting.pdf",
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      ...calculateDueDetails(dueIn5Days),
    },
    {
      id: "asgn_dsa_4",
      userId,
      title: "Design & Analysis of Algorithms — 0/1 Knapsack DP Benchmark",
      subject: "Data Structures & Algorithms",
      description: "Compare recursive, memoized, and space-optimized 1D array DP approaches with large weight vectors.",
      dueDate: dueIn7Days,
      priority: "MEDIUM",
      status: "PENDING",
      attachmentUrl: "/sample-notes/dsa-dp-patterns.pdf",
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      ...calculateDueDetails(dueIn7Days),
    },
    {
      id: "asgn_oop_5",
      userId,
      title: "OOP SOLID Principles Refactoring in Java",
      subject: "Object-Oriented Programming",
      description: "Refactor an e-commerce order management codebase to adhere strictly to SRP, OCP, and Dependency Inversion.",
      dueDate: dueIn10Days,
      priority: "LOW",
      status: "COMPLETED",
      attachmentUrl: "/sample-notes/oop-solid.pdf",
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      ...calculateDueDetails(dueIn10Days),
    },
  ];
}

function getUserAssignmentsList(userId: string): AssignmentItem[] {
  if (!mockAssignmentsStore.has(userId)) {
    mockAssignmentsStore.set(userId, getInitialDemoAssignments(userId));
  }
  return mockAssignmentsStore.get(userId)!;
}

export class AssignmentsService {
  /**
   * Fetch all assignments for student with multi-criteria filtering
   */
  static async getAssignments(
    userId: string,
    filters?: AssignmentsFilterInput
  ): Promise<AssignmentItem[]> {
    try {
      const dbEntries = await prisma.assignment.findMany({
        where: {
          userId,
          ...(filters?.status && filters.status !== "ALL"
            ? { status: filters.status }
            : {}),
          ...(filters?.priority && filters.priority !== "ALL"
            ? { priority: filters.priority }
            : {}),
          ...(filters?.subject && filters.subject !== "ALL"
            ? { subject: filters.subject }
            : {}),
          ...(filters?.query
            ? {
                OR: [
                  { title: { contains: filters.query, mode: "insensitive" } },
                  { description: { contains: filters.query, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        orderBy: { dueDate: "asc" },
      });

      if (dbEntries && dbEntries.length > 0) {
        return dbEntries.map((a) => ({
          ...a,
          priority: a.priority as AssignmentPriority,
          status: a.status as AssignmentStatus,
          ...calculateDueDetails(new Date(a.dueDate)),
        }));
      }
    } catch {
      // In-memory fallback
    }

    let list = [...getUserAssignmentsList(userId)];

    // Filter status
    if (filters?.status && filters.status !== "ALL") {
      list = list.filter((a) => a.status === filters.status);
    }

    // Filter priority
    if (filters?.priority && filters.priority !== "ALL") {
      list = list.filter((a) => a.priority === filters.priority);
    }

    // Filter subject
    if (filters?.subject && filters.subject !== "ALL") {
      list = list.filter((a) => a.subject.toLowerCase() === filters.subject!.toLowerCase());
    }

    // Filter query
    if (filters?.query && filters.query.trim()) {
      const q = filters.query.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.description && a.description.toLowerCase().includes(q)) ||
          a.subject.toLowerCase().includes(q)
      );
    }

    // Sort
    const sortBy = filters?.sortBy || "due_soonest";
    list.sort((a, b) => {
      if (sortBy === "due_latest") {
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "priority") {
        const order: Record<AssignmentPriority, number> = {
          URGENT: 1,
          HIGH: 2,
          MEDIUM: 3,
          LOW: 4,
        };
        return (order[a.priority] || 99) - (order[b.priority] || 99);
      }
      // default: due_soonest
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    return list;
  }

  /**
   * Get single assignment by ID
   */
  static async getAssignmentById(id: string, userId: string): Promise<AssignmentItem | null> {
    const all = await this.getAssignments(userId);
    return all.find((a) => a.id === id && a.userId === userId) || null;
  }

  /**
   * Add a new assignment
   */
  static async createAssignment(
    userId: string,
    input: CreateAssignmentInput
  ): Promise<AssignmentItem> {
    const due = new Date(input.dueDate);
    const newAssignment: AssignmentItem = {
      id: `asgn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      title: input.title,
      subject: input.subject,
      description: input.description || null,
      dueDate: due,
      priority: input.priority || "MEDIUM",
      status: input.status || "PENDING",
      attachmentUrl: input.attachmentUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...calculateDueDetails(due),
    };

    try {
      const created = await prisma.assignment.create({
        data: {
          id: newAssignment.id,
          userId,
          title: newAssignment.title,
          subject: newAssignment.subject,
          description: newAssignment.description,
          dueDate: newAssignment.dueDate,
          priority: newAssignment.priority,
          status: newAssignment.status,
          attachmentUrl: newAssignment.attachmentUrl,
        },
      });
      return {
        ...created,
        priority: created.priority as AssignmentPriority,
        status: created.status as AssignmentStatus,
        ...calculateDueDetails(new Date(created.dueDate)),
      };
    } catch {
      const list = getUserAssignmentsList(userId);
      list.unshift(newAssignment);
      mockAssignmentsStore.set(userId, list);
      return newAssignment;
    }
  }

  /**
   * Update assignment details
   */
  static async updateAssignment(
    id: string,
    userId: string,
    input: UpdateAssignmentInput
  ): Promise<AssignmentItem> {
    try {
      const updated = await prisma.assignment.update({
        where: { id },
        data: {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.subject !== undefined ? { subject: input.subject } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.dueDate !== undefined ? { dueDate: new Date(input.dueDate) } : {}),
          ...(input.priority !== undefined ? { priority: input.priority } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
          ...(input.attachmentUrl !== undefined ? { attachmentUrl: input.attachmentUrl } : {}),
        },
      });
      return {
        ...updated,
        priority: updated.priority as AssignmentPriority,
        status: updated.status as AssignmentStatus,
        ...calculateDueDetails(new Date(updated.dueDate)),
      };
    } catch {
      const list = getUserAssignmentsList(userId);
      const index = list.findIndex((a) => a.id === id && a.userId === userId);
      if (index === -1) throw new Error("Assignment not found or unauthorized");

      const existing = list[index];
      const dueDate = input.dueDate ? new Date(input.dueDate) : existing.dueDate;
      const merged: AssignmentItem = {
        ...existing,
        ...input,
        dueDate,
        updatedAt: new Date(),
        ...calculateDueDetails(dueDate),
      };
      list[index] = merged;
      mockAssignmentsStore.set(userId, list);
      return merged;
    }
  }

  /**
   * Toggle assignment status between PENDING and COMPLETED
   */
  static async toggleStatus(id: string, userId: string): Promise<AssignmentItem> {
    const assignment = await this.getAssignmentById(id, userId);
    if (!assignment) throw new Error("Assignment not found or unauthorized");

    const newStatus: AssignmentStatus =
      assignment.status === "COMPLETED" ? "PENDING" : "COMPLETED";

    return this.updateAssignment(id, userId, { status: newStatus });
  }

  /**
   * Delete assignment
   */
  static async deleteAssignment(id: string, userId: string): Promise<boolean> {
    try {
      await prisma.assignment.delete({
        where: { id },
      });
      return true;
    } catch {
      const list = getUserAssignmentsList(userId);
      const index = list.findIndex((a) => a.id === id && a.userId === userId);
      if (index !== -1) {
        list.splice(index, 1);
        mockAssignmentsStore.set(userId, list);
        return true;
      }
      return false;
    }
  }

  /**
   * Get upcoming assignments for dashboard widgets
   */
  static async getUpcomingAssignments(userId: string, limit = 5): Promise<AssignmentItem[]> {
    const all = await this.getAssignments(userId, { sortBy: "due_soonest" });
    return all.slice(0, limit);
  }

  /**
   * Summary metrics for assignments header
   */
  static async getAssignmentsStats(userId: string): Promise<AssignmentsStats> {
    const all = await this.getAssignments(userId);
    let pending = 0;
    let inProgress = 0;
    let completed = 0;
    let overdue = 0;

    for (const a of all) {
      if (a.status === "COMPLETED") completed++;
      else if (a.dueDays < 0) overdue++;
      else if (a.status === "IN_PROGRESS") inProgress++;
      else pending++;
    }

    const completionRate =
      all.length > 0 ? Math.round((completed / all.length) * 100) : 0;

    return {
      total: all.length,
      pending,
      inProgress,
      completed,
      overdue,
      completionRate,
    };
  }
}
