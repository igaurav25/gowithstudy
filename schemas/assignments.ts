import { z } from "zod";

export const ASSIGNMENT_PRIORITIES = ["URGENT", "HIGH", "MEDIUM", "LOW"] as const;
export type AssignmentPriority = (typeof ASSIGNMENT_PRIORITIES)[number];

export const ASSIGNMENT_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "OVERDUE",
] as const;
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export const createAssignmentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  subject: z
    .string()
    .trim()
    .min(2, "Subject name must be at least 2 characters")
    .max(60, "Subject name cannot exceed 60 characters"),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  dueDate: z.string().min(1, "Due date is required"),
  priority: z.enum(ASSIGNMENT_PRIORITIES).default("MEDIUM"),
  status: z.enum(ASSIGNMENT_STATUSES).default("PENDING"),
  attachmentUrl: z.string().optional().or(z.literal("")),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;

export const updateAssignmentSchema = createAssignmentSchema.partial();
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;

export const assignmentsFilterSchema = z.object({
  query: z.string().optional(),
  status: z.enum([...ASSIGNMENT_STATUSES, "ALL"]).optional(),
  priority: z.enum([...ASSIGNMENT_PRIORITIES, "ALL"]).optional(),
  subject: z.string().optional(),
  sortBy: z.enum(["due_soonest", "due_latest", "priority", "title"]).optional(),
});

export type AssignmentsFilterInput = z.infer<typeof assignmentsFilterSchema>;
