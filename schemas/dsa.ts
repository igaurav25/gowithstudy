import { z } from "zod";

export const DSA_DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;
export type DSADifficulty = (typeof DSA_DIFFICULTIES)[number];

export const DSA_STATUSES = ["UNSOLVED", "SOLVED", "REVISION_NEEDED"] as const;
export type DSAStatus = (typeof DSA_STATUSES)[number];

export const DSA_PLATFORMS = [
  "LEETCODE",
  "GEEKSFORGEEKS",
  "CODECHEF",
  "HACKERRANK",
  "OTHER",
] as const;
export type DSAPlatform = (typeof DSA_PLATFORMS)[number];

export const DSA_CATEGORIES = [
  "Arrays & Strings",
  "Linked Lists",
  "Trees & BST",
  "Graphs (BFS/DFS)",
  "Dynamic Programming",
  "Binary Search",
  "Recursion & Backtracking",
  "Stacks & Queues",
  "Greedy & Tries",
] as const;
export type DSACategory = (typeof DSA_CATEGORIES)[number];

export const createDSAProblemSchema = z.object({
  title: z
    .string()
    .min(3, "Problem title must be at least 3 characters")
    .max(120, "Problem title cannot exceed 120 characters"),
  category: z.enum(DSA_CATEGORIES, {
    message: "Please select a valid DSA category",
  }),
  difficulty: z.enum(DSA_DIFFICULTIES, {
    message: "Please select a valid difficulty level",
  }),
  platform: z.enum(DSA_PLATFORMS).default("LEETCODE"),
  problemUrl: z
    .string()
    .url("Please provide a valid problem URL")
    .or(z.literal(""))
    .optional()
    .nullable(),
  timeComplexity: z.string().max(30).optional().nullable(),
  spaceComplexity: z.string().max(30).optional().nullable(),
  companyTags: z.array(z.string()).default([]),
  notes: z.string().max(2000).optional().nullable(),
  solutionCode: z.string().max(10000).optional().nullable(),
  status: z.enum(DSA_STATUSES).default("UNSOLVED"),
});

export type CreateDSAProblemInput = z.infer<typeof createDSAProblemSchema>;

export const updateDSAProblemSchema = createDSAProblemSchema.partial();
export type UpdateDSAProblemInput = z.infer<typeof updateDSAProblemSchema>;

export const dsaFilterSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(["ALL", ...DSA_DIFFICULTIES]).default("ALL"),
  status: z.enum(["ALL", ...DSA_STATUSES]).default("ALL"),
  company: z.string().optional(),
  sortBy: z
    .enum(["default", "difficulty_asc", "difficulty_desc", "title", "recent"])
    .default("default"),
});

export type DSAFilterInput = z.infer<typeof dsaFilterSchema>;
