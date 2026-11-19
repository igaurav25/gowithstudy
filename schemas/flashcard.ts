import { z } from "zod";

export const flashcardRatingSchema = z.enum(["AGAIN", "GOOD", "EASY"]);
export type FlashcardRating = z.infer<typeof flashcardRatingSchema>;

export const flashcardItemSchema = z.object({
  id: z.string(),
  deckId: z.string(),
  subject: z.string(),
  topic: z.string(),
  front: z.string().min(3),
  back: z.string().min(3),
  mnemonic: z.string().optional(),
  examinerTip: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  repetitionCount: z.number().int().default(0),
  intervalDays: z.number().default(1),
  lastReviewedAt: z.date().optional(),
});

export type FlashcardItem = z.infer<typeof flashcardItemSchema>;

export const quizQuestionSchema = z.object({
  id: z.string(),
  deckId: z.string(),
  subject: z.string(),
  topic: z.string(),
  question: z.string().min(5),
  options: z.array(z.string()).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(5),
});

export type QuizQuestion = z.infer<typeof quizQuestionSchema>;

export const studyDeckSchema = z.object({
  id: z.string(),
  title: z.string(),
  subject: z.string(),
  description: z.string(),
  cardCount: z.number().int(),
  cards: z.array(flashcardItemSchema),
  quizzes: z.array(quizQuestionSchema),
  createdAt: z.date(),
});

export type StudyDeck = z.infer<typeof studyDeckSchema>;

export const generateStudySetSchema = z.object({
  subject: z.string().min(2),
  noteTitle: z.string().optional(),
  notesText: z.string().min(10, "Please provide at least 10 characters of lecture content."),
  cardCount: z.number().int().min(3).max(20).default(5),
});

export type GenerateStudySetInput = z.infer<typeof generateStudySetSchema>;
