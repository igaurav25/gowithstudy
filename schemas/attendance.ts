import { z } from "zod";

export const attendanceStatusSchema = z.enum(["PRESENT", "ABSENT"]);
export type AttendanceStatus = z.infer<typeof attendanceStatusSchema>;

export const subjectAttendanceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  subject: z.string().min(2, "Subject name must be at least 2 characters"),
  code: z.string().optional().nullable(),
  attended: z.number().int().min(0, "Attended count cannot be negative"),
  total: z.number().int().min(0, "Total count cannot be negative"),
  targetPercentage: z.number().int().min(50).max(100).default(75),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SubjectAttendanceItem = z.infer<typeof subjectAttendanceSchema>;

export const createSubjectAttendanceSchema = z.object({
  subject: z.string().min(2, "Subject name must be at least 2 characters"),
  code: z.string().optional(),
  attended: z.number().int().min(0, "Attended count cannot be negative"),
  total: z.number().int().min(1, "Total classes conducted must be at least 1"),
  targetPercentage: z.number().int().min(50).max(100).default(75),
});

export type CreateSubjectAttendanceInput = z.infer<typeof createSubjectAttendanceSchema>;

export const updateSubjectAttendanceSchema = z.object({
  subjectId: z.string(),
  attended: z.number().int().min(0),
  total: z.number().int().min(0),
  targetPercentage: z.number().int().min(50).max(100).optional(),
});

export type UpdateSubjectAttendanceInput = z.infer<typeof updateSubjectAttendanceSchema>;

export const markAttendanceSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  status: attendanceStatusSchema,
});

export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;

export interface SubjectComputedStats extends SubjectAttendanceItem {
  percentage: number;
  status: "SAFE" | "BORDERLINE" | "DANGER";
  safeBunks: number;
  classesToRecover: number;
  bunkAdvice: string;
}

export interface OverallAttendanceSummary {
  overallPercentage: number;
  totalAttended: number;
  totalConducted: number;
  safeSubjectCount: number;
  riskSubjectCount: number;
  targetPercentage: number;
  subjects: SubjectComputedStats[];
}
