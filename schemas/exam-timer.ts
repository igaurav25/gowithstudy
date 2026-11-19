import { z } from "zod";

export const examCategorySchema = z.enum([
  "MID_SEM",
  "END_SEM",
  "PRACTICAL_VIVA",
  "INTERNAL_ASSESSMENT",
]);
export type ExamCategory = z.infer<typeof examCategorySchema>;

export const examItemSchema = z.object({
  id: z.string(),
  subject: z.string().min(2),
  courseCode: z.string().min(2),
  category: examCategorySchema,
  date: z.date(),
  time: z.string(),
  venue: z.string().optional(),
  targetScore: z.number().int().min(1).max(100).default(80),
  syllabusCompletedPercent: z.number().int().min(0).max(100).default(50),
});

export type ExamItem = z.infer<typeof examItemSchema>;

export const pomodoroLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  subject: z.string(),
  durationMinutes: z.number().int().min(1),
  completedAt: z.date(),
});

export type PomodoroLog = z.infer<typeof pomodoroLogSchema>;
