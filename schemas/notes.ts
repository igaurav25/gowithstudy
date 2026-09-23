import { z } from "zod";

export const NOTE_STATUSES = ["IN_PROGRESS", "COMPLETED", "READ"] as const;
export type NoteStatus = (typeof NOTE_STATUSES)[number];

export const NOTE_CATEGORIES = [
  "Lecture Notes",
  "Exam Prep",
  "Cheatsheet",
  "Lab Manual",
  "Research Paper",
  "Assignment Help",
  "General",
] as const;
export type NoteCategory = (typeof NOTE_CATEGORIES)[number];

export const STANDARD_CSE_SUBJECTS = [
  "Operating Systems",
  "Database Management Systems",
  "Computer Networks",
  "Data Structures & Algorithms",
  "Object-Oriented Programming",
  "Software Engineering",
  "Machine Learning",
  "Computer Organization & Architecture",
  "Theory of Computation",
  "Compiler Design",
] as const;

// Maximum allowed PDF upload size: 25MB
export const MAX_PDF_FILE_SIZE = 25 * 1024 * 1024;
export const ALLOWED_PDF_MIME_TYPES = ["application/pdf"] as const;

/**
 * Client and server validation for creating a new study note
 */
export const createNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  subject: z
    .string()
    .trim()
    .min(2, "Subject name must be at least 2 characters")
    .max(60, "Subject name cannot exceed 60 characters"),
  category: z.string().default("Lecture Notes"),
  tags: z
    .array(z.string().trim().min(1).max(30))
    .max(10, "Cannot exceed 10 tags")
    .default([]),
  status: z.enum(NOTE_STATUSES).default("IN_PROGRESS"),
  fileUrl: z.string().optional().or(z.literal("")),
  fileName: z.string().optional().or(z.literal("")),
  fileSize: z.number().nonnegative().optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

/**
 * Validation schema for updating an existing study note
 */
export const updateNoteSchema = createNoteSchema.partial();
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

/**
 * Filter and query parameters for notes library
 */
export const notesFilterSchema = z.object({
  query: z.string().optional(),
  subject: z.string().optional(),
  category: z.string().optional(),
  status: z.enum([...NOTE_STATUSES, "ALL"]).optional(),
  isArchived: z.boolean().optional(),
  sortBy: z.enum(["newest", "oldest", "title", "size"]).optional(),
});

export type NotesFilterInput = z.infer<typeof notesFilterSchema>;

/**
 * Update note status schema
 */
export const updateNoteStatusSchema = z.object({
  status: z.enum(NOTE_STATUSES),
});

export type UpdateNoteStatusInput = z.infer<typeof updateNoteStatusSchema>;
