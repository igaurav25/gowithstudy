import { z } from "zod";

export const STUDY_MODES = ["EXPLAIN", "QUIZ", "SUMMARY", "CODE"] as const;
export type StudyMode = (typeof STUDY_MODES)[number];
export type AIStudyMode = StudyMode;

export const askQuestionSchema = z.object({
  query: z
    .string()
    .trim()
    .min(2, "Question must be at least 2 characters")
    .max(1000, "Question cannot exceed 1000 characters"),
  noteId: z.string().optional().default("ALL"),
  mode: z.enum(STUDY_MODES).default("EXPLAIN"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
});

export type AskQuestionInput = z.infer<typeof askQuestionSchema>;

export const generateQuizSchema = z.object({
  noteId: z.string().min(1, "Please select a study material to generate a quiz"),
  count: z.number().int().min(1).max(10).optional().default(3),
});

export type GenerateQuizInput = z.infer<typeof generateQuizSchema>;

export const generateSummarySchema = z.object({
  noteId: z.string().min(1, "Please select a study material to generate a summary"),
});

export type GenerateSummaryInput = z.infer<typeof generateSummarySchema>;
