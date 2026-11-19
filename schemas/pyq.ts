import { z } from "zod";

export const examTypeSchema = z.enum(["END_SEM", "MID_SEM", "RE_EXAM"]);
export type ExamType = z.infer<typeof examTypeSchema>;

export const pyqQuestionSchema = z.object({
  id: z.string(),
  questionNumber: z.string(),
  marks: z.number().int().min(1),
  text: z.string().min(5),
  topicTag: z.string(),
  solvedAnswer: z.string().optional(),
});

export type PYQQuestionItem = z.infer<typeof pyqQuestionSchema>;

export const pyqPaperSchema = z.object({
  id: z.string(),
  title: z.string(),
  subject: z.string(),
  courseCode: z.string(),
  semester: z.number().int().min(1).max(8),
  year: z.number().int().min(2018).max(2026),
  university: z.string(),
  examType: examTypeSchema,
  totalMarks: z.number().int(),
  durationMinutes: z.number().int(),
  questions: z.array(pyqQuestionSchema),
  downloadUrl: z.string().optional(),
  createdAt: z.date(),
});

export type PYQPaperItem = z.infer<typeof pyqPaperSchema>;

export const pyqFilterSchema = z.object({
  subject: z.string().optional(),
  semester: z.number().int().optional(),
  year: z.number().int().optional(),
  examType: examTypeSchema.optional(),
  search: z.string().optional(),
});

export type PYQFilterInput = z.infer<typeof pyqFilterSchema>;
