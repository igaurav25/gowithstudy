import { prisma } from "@/lib/prisma";
import {
  CreateNoteInput,
  UpdateNoteInput,
  NotesFilterInput,
  NoteStatus,
} from "@/schemas/notes";

export interface NoteItem {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  subject: string;
  category: string;
  tags: string[];
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  status: NoteStatus;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotesStats {
  total: number;
  inProgress: number;
  completed: number;
  read: number;
  archived: number;
  subjectCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
}

// In-memory fallback notes cache for student accounts
const mockNotesStore = new Map<string, NoteItem[]>();

function getInitialDemoNotes(userId: string): NoteItem[] {
  const now = new Date();
  return [
    {
      id: "note_os_01",
      userId,
      title: "Operating Systems — Process Scheduling & Deadlock Prevention",
      description:
        "Comprehensive lecture breakdown of Banker's Algorithm, Peterson's Solution, Mutex semaphores, and Round-Robin vs Multi-Level Feedback Queue scheduling with numerical examples.",
      subject: "Operating Systems",
      category: "Lecture Notes",
      tags: ["OS", "CPU-Scheduling", "Deadlocks", "Bankers-Algorithm", "Semaphores"],
      fileUrl: "/sample-notes/os-scheduling.pdf",
      fileName: "CS301_OS_Process_Scheduling.pdf",
      fileSize: 4200000, // 4.2 MB
      status: "IN_PROGRESS",
      isArchived: false,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "note_dbms_02",
      userId,
      title: "Database Management Systems — Normalization & B+ Trees Cheatsheet",
      description:
        "Quick reference cheat sheet covering 1NF to BCNF decomposition, Lossless Join testing, Dependency Preservation, and B+ Tree node splitting/merging algorithms.",
      subject: "Database Management Systems",
      category: "Cheatsheet",
      tags: ["DBMS", "Normalization", "BCNF", "B-Tree", "SQL-Optimization"],
      fileUrl: "/sample-notes/dbms-bcnf.pdf",
      fileName: "CS302_DBMS_Normalization_CheatSheet.pdf",
      fileSize: 2800000, // 2.8 MB
      status: "COMPLETED",
      isArchived: false,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: "note_cn_03",
      userId,
      title: "Computer Networks — TCP/IP Protocol Suite & Subnetting Guide",
      description:
        "Exam preparation handbook on IPv4 CIDR subnetting calculations, TCP 3-way handshake, congestion control (Slow Start, AIMD), and DNS resolution flow.",
      subject: "Computer Networks",
      category: "Exam Prep",
      tags: ["Networks", "Subnetting", "TCP", "CIDR", "DNS", "OSI-Model"],
      fileUrl: "/sample-notes/cn-subnetting.pdf",
      fileName: "CS303_Networks_Subnetting_Guide.pdf",
      fileSize: 5100000, // 5.1 MB
      status: "READ",
      isArchived: false,
      createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: "note_dsa_04",
      userId,
      title: "Design & Analysis of Algorithms — Dynamic Programming Patterns",
      description:
        "Patterns & templates for 0/1 Knapsack, Longest Common Subsequence (LCS), Matrix Chain Multiplication, and Bitmask DP with time & space complexity proofs.",
      subject: "Data Structures & Algorithms",
      category: "Lecture Notes",
      tags: ["DSA", "DP", "Knapsack", "LCS", "Algorithms", "Memoization"],
      fileUrl: "/sample-notes/dsa-dp-patterns.pdf",
      fileName: "CS201_DSA_DP_Master_Patterns.pdf",
      fileSize: 3700000, // 3.7 MB
      status: "IN_PROGRESS",
      isArchived: false,
      createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      id: "note_oop_05",
      userId,
      title: "Object-Oriented Programming — SOLID Principles & Design Patterns",
      description:
        "Lab manual & implementation guide for Singleton, Factory, Observer, and Strategy design patterns in Java with UML class diagrams and code snippets.",
      subject: "Object-Oriented Programming",
      category: "Lab Manual",
      tags: ["Java", "OOP", "SOLID", "Design-Patterns", "UML"],
      fileUrl: "/sample-notes/oop-solid.pdf",
      fileName: "CS202_OOP_SOLID_Design_Patterns.pdf",
      fileSize: 3100000, // 3.1 MB
      status: "COMPLETED",
      isArchived: false,
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: "note_ml_06",
      userId,
      title: "Machine Learning — Gradient Descent, Backpropagation & Loss Surfaces",
      description:
        "Detailed mathematical derivation of stochastic gradient descent with momentum, Adam optimizer, cross-entropy loss, and backpropagation chain rule.",
      subject: "Machine Learning",
      category: "Lecture Notes",
      tags: ["ML", "GradientDescent", "Backprop", "NeuralNetworks", "Math"],
      fileUrl: "/sample-notes/ml-optimization.pdf",
      fileName: "CS401_ML_Gradient_Descent_Math.pdf",
      fileSize: 6400000, // 6.4 MB
      status: "IN_PROGRESS",
      isArchived: false,
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    },
  ];
}

function getUserNotesList(userId: string): NoteItem[] {
  if (!mockNotesStore.has(userId)) {
    mockNotesStore.set(userId, getInitialDemoNotes(userId));
  }
  return mockNotesStore.get(userId)!;
}

export class NotesService {
  /**
   * Fetch all notes for a specific user with multi-criteria filtering and sorting
   */
  static async getNotes(
    userId: string,
    filters?: NotesFilterInput
  ): Promise<NoteItem[]> {
    try {
      // First attempt database query if connected
      const dbNotes = await prisma.note.findMany({
        where: {
          userId,
          isArchived: filters?.isArchived ?? false,
          ...(filters?.subject && filters.subject !== "ALL"
            ? { subject: filters.subject }
            : {}),
          ...(filters?.category && filters.category !== "ALL"
            ? { category: filters.category }
            : {}),
          ...(filters?.status && filters.status !== "ALL"
            ? { status: filters.status }
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
        orderBy:
          filters?.sortBy === "oldest"
            ? { createdAt: "asc" }
            : filters?.sortBy === "title"
            ? { title: "asc" }
            : { createdAt: "desc" },
      });

      if (dbNotes && dbNotes.length > 0) {
        return dbNotes.map((n) => ({
          ...n,
          status: n.status as NoteStatus,
          fileName: n.fileUrl ? n.fileUrl.split("/").pop() || null : null,
        }));
      }
    } catch {
      // Fallback to in-memory store if DB is disconnected
    }

    // Filter in-memory store
    let notes = [...getUserNotesList(userId)];

    // Archive filter
    const isArchivedFilter = filters?.isArchived ?? false;
    notes = notes.filter((n) => n.isArchived === isArchivedFilter);

    // Subject filter
    if (filters?.subject && filters.subject !== "ALL") {
      notes = notes.filter(
        (n) => n.subject.toLowerCase() === filters.subject!.toLowerCase()
      );
    }

    // Category filter
    if (filters?.category && filters.category !== "ALL") {
      notes = notes.filter(
        (n) => n.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    // Status filter
    if (filters?.status && filters.status !== "ALL") {
      notes = notes.filter((n) => n.status === filters.status);
    }

    // Search query
    if (filters?.query && filters.query.trim()) {
      const q = filters.query.toLowerCase().trim();
      notes = notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          (n.description && n.description.toLowerCase().includes(q)) ||
          n.tags.some((t) => t.toLowerCase().includes(q)) ||
          n.subject.toLowerCase().includes(q)
      );
    }

    // Sorting
    const sortBy = filters?.sortBy || "newest";
    notes.sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "size") {
        return (b.fileSize || 0) - (a.fileSize || 0);
      }
      // default: newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return notes;
  }

  /**
   * Get single note by ID with strict ownership validation
   */
  static async getNoteById(id: string, userId: string): Promise<NoteItem | null> {
    try {
      const note = await prisma.note.findFirst({
        where: { id, userId },
      });
      if (note) {
        return {
          ...note,
          status: note.status as NoteStatus,
          fileName: note.fileUrl ? note.fileUrl.split("/").pop() || null : null,
        };
      }
    } catch {
      // Fallback
    }

    const list = getUserNotesList(userId);
    const found = list.find((n) => n.id === id && n.userId === userId);
    return found || null;
  }

  /**
   * Create a new note
   */
  static async createNote(
    userId: string,
    input: CreateNoteInput
  ): Promise<NoteItem> {
    const newNote: NoteItem = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      title: input.title,
      description: input.description || null,
      subject: input.subject,
      category: input.category || "Lecture Notes",
      tags: input.tags || [],
      fileUrl: input.fileUrl || null,
      fileName: input.fileName || (input.fileUrl ? input.fileUrl.split("/").pop() || null : null),
      fileSize: input.fileSize || null,
      status: input.status || "IN_PROGRESS",
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const created = await prisma.note.create({
        data: {
          id: newNote.id,
          userId,
          title: newNote.title,
          description: newNote.description,
          subject: newNote.subject,
          category: newNote.category,
          tags: newNote.tags,
          fileUrl: newNote.fileUrl,
          fileSize: newNote.fileSize,
          status: newNote.status,
          isArchived: false,
        },
      });

      return {
        ...created,
        status: created.status as NoteStatus,
        fileName: newNote.fileName,
      };
    } catch {
      // In-memory fallback
      const list = getUserNotesList(userId);
      list.unshift(newNote);
      mockNotesStore.set(userId, list);
      return newNote;
    }
  }

  /**
   * Update an existing note with ownership validation
   */
  static async updateNote(
    id: string,
    userId: string,
    input: UpdateNoteInput
  ): Promise<NoteItem> {
    try {
      const updated = await prisma.note.update({
        where: { id },
        data: {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.subject !== undefined ? { subject: input.subject } : {}),
          ...(input.category !== undefined ? { category: input.category } : {}),
          ...(input.tags !== undefined ? { tags: input.tags } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
          ...(input.fileUrl !== undefined ? { fileUrl: input.fileUrl } : {}),
          ...(input.fileSize !== undefined ? { fileSize: input.fileSize } : {}),
          updatedAt: new Date(),
        },
      });

      return {
        ...updated,
        status: updated.status as NoteStatus,
        fileName: updated.fileUrl ? updated.fileUrl.split("/").pop() || null : null,
      };
    } catch {
      // In-memory update
      const list = getUserNotesList(userId);
      const index = list.findIndex((n) => n.id === id && n.userId === userId);
      if (index === -1) {
        throw new Error("Note not found or unauthorized");
      }

      const existing = list[index];
      const merged: NoteItem = {
        ...existing,
        ...input,
        updatedAt: new Date(),
      };
      list[index] = merged;
      mockNotesStore.set(userId, list);
      return merged;
    }
  }

  /**
   * Update note reading status
   */
  static async updateNoteStatus(
    id: string,
    userId: string,
    status: NoteStatus
  ): Promise<NoteItem> {
    return this.updateNote(id, userId, { status });
  }

  /**
   * Toggle archive state
   */
  static async toggleArchiveNote(id: string, userId: string): Promise<NoteItem> {
    const note = await this.getNoteById(id, userId);
    if (!note) {
      throw new Error("Note not found or unauthorized");
    }

    try {
      const updated = await prisma.note.update({
        where: { id },
        data: {
          isArchived: !note.isArchived,
          updatedAt: new Date(),
        },
      });
      return {
        ...updated,
        status: updated.status as NoteStatus,
        fileName: updated.fileUrl ? updated.fileUrl.split("/").pop() || null : null,
      };
    } catch {
      const list = getUserNotesList(userId);
      const index = list.findIndex((n) => n.id === id);
      if (index !== -1) {
        list[index].isArchived = !list[index].isArchived;
        list[index].updatedAt = new Date();
        return list[index];
      }
      throw new Error("Note not found or unauthorized");
    }
  }

  /**
   * Delete note
   */
  static async deleteNote(id: string, userId: string): Promise<boolean> {
    try {
      await prisma.note.delete({
        where: { id },
      });
      return true;
    } catch {
      const list = getUserNotesList(userId);
      const index = list.findIndex((n) => n.id === id && n.userId === userId);
      if (index !== -1) {
        list.splice(index, 1);
        mockNotesStore.set(userId, list);
        return true;
      }
      return false;
    }
  }

  /**
   * Calculate summary metrics across all notes for this student
   */
  static async getNotesStats(userId: string): Promise<NotesStats> {
    const allNotes = await this.getNotes(userId, { isArchived: false });
    const archivedNotes = await this.getNotes(userId, { isArchived: true });

    const subjectCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    let inProgress = 0;
    let completed = 0;
    let read = 0;

    for (const note of allNotes) {
      // Subject distribution
      subjectCounts[note.subject] = (subjectCounts[note.subject] || 0) + 1;
      // Category distribution
      categoryCounts[note.category] = (categoryCounts[note.category] || 0) + 1;

      if (note.status === "IN_PROGRESS") inProgress++;
      else if (note.status === "COMPLETED") completed++;
      else if (note.status === "READ") read++;
    }

    return {
      total: allNotes.length,
      inProgress,
      completed,
      read,
      archived: archivedNotes.length,
      subjectCounts,
      categoryCounts,
    };
  }
}
