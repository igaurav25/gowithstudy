import { z } from "zod";

export const COLLEGE_INFO_CATEGORIES = [
  "ACADEMIC",
  "CIRCULAR",
  "EXAM_SCHEDULE",
  "FEE_DEADLINE",
  "CAMPUS_FACILITY",
  "DEPARTMENT_RESOURCE",
] as const;

export type CollegeInfoCategory = (typeof COLLEGE_INFO_CATEGORIES)[number];

export const COLLEGE_INFO_CATEGORY_LABELS: Record<CollegeInfoCategory, string> = {
  ACADEMIC: "Academic Ordinance",
  CIRCULAR: "Official Circular",
  EXAM_SCHEDULE: "Exam Timetable",
  FEE_DEADLINE: "Fee & Scholarship",
  CAMPUS_FACILITY: "Campus & Labs",
  DEPARTMENT_RESOURCE: "Department Resource",
};

export const VERIFICATION_STATES = ["VERIFIED", "PENDING_REVIEW", "ARCHIVED"] as const;
export type VerificationState = (typeof VERIFICATION_STATES)[number];

export const createCollegeInfoSchema = z.object({
  collegeCode: z.string().min(2, "College code is required (e.g. DTU, IITB)"),
  category: z.enum(COLLEGE_INFO_CATEGORIES, {
    message: "Select a valid category",
  }),
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(160, "Title cannot exceed 160 characters"),
  content: z
    .string()
    .min(20, "Content must be at least 20 characters providing full notice details")
    .max(10000, "Content exceeds maximum length"),
  refNumber: z
    .string()
    .trim()
    .max(80, "Reference number cannot exceed 80 characters")
    .optional()
    .or(z.literal("")),
  officialDocUrl: z
    .string()
    .url("Please enter a valid document URL (PDF/Drive link)")
    .optional()
    .or(z.literal("")),
  department: z
    .string()
    .max(80, "Department name is too long")
    .optional()
    .or(z.literal("")),
  verifiedBy: z
    .string()
    .min(3, "Authorized authority name/title is required (e.g. Dean of Academic Affairs)")
    .max(100, "Authority designation too long"),
  validUntil: z.string().optional().or(z.literal("")),
  isPinned: z.boolean().default(false),
});

export type CreateCollegeInfoInput = z.infer<typeof createCollegeInfoSchema>;

export const updateCollegeInfoSchema = createCollegeInfoSchema.partial().extend({
  id: z.string().min(1, "Item ID is required"),
  verifiedState: z.enum(VERIFICATION_STATES).optional(),
});

export type UpdateCollegeInfoInput = z.infer<typeof updateCollegeInfoSchema>;

export const collegeInfoFilterSchema = z.object({
  collegeCode: z.string().optional().default("DTU"),
  category: z.enum(COLLEGE_INFO_CATEGORIES).optional().or(z.literal("ALL")),
  department: z.string().optional(),
  query: z.string().optional(),
  verifiedOnly: z.boolean().optional().default(false),
});

export interface CollegeInfoFilterInput {
  collegeCode?: string;
  category?: CollegeInfoCategory | "ALL";
  department?: string;
  query?: string;
  verifiedOnly?: boolean;
}
