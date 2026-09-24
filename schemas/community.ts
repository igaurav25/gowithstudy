import { z } from "zod";

export const COMMUNITY_CATEGORIES = [
  "STUDY",
  "PROGRAMMING",
  "PLACEMENTS",
  "INTERNSHIPS",
  "PROJECTS",
  "COLLEGE_LIFE",
  "RESOURCES",
] as const;

export type CommunityCategory = (typeof COMMUNITY_CATEGORIES)[number];

export const REACTION_TYPES = ["UPVOTE", "HEART", "HELPFUL"] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];

export const REPORT_REASONS = [
  "SPAM",
  "HARASSMENT",
  "INAPPROPRIATE",
  "MISINFORMATION",
  "PLAGIARISM",
  "OTHER",
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const SORT_OPTIONS = [
  "trending",
  "recent",
  "top_voted",
  "most_discussed",
] as const;
export type CommunitySortOption = (typeof SORT_OPTIONS)[number];

export const createPostSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(150, "Title must not exceed 150 characters"),
  content: z
    .string()
    .min(10, "Post content must be at least 10 characters")
    .max(5000, "Content cannot exceed 5000 characters"),
  category: z.enum(COMMUNITY_CATEGORIES),
  tags: z
    .array(z.string().trim().min(1).max(25))
    .min(1, "Please provide at least one relevant tag")
    .max(5, "Maximum 5 tags permitted")
    .default(["general"]),
  isPinned: z.boolean().optional(),
  isAnonymous: z.boolean().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const updatePostSchema = createPostSchema.partial();
export type UpdatePostInput = z.infer<typeof updatePostSchema>;

export const createCommentSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  content: z
    .string()
    .min(2, "Comment must be at least 2 characters")
    .max(2000, "Comment cannot exceed 2000 characters"),
  parentCommentId: z.string().optional().nullable(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const postReactionSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  type: z.enum(REACTION_TYPES).default("UPVOTE"),
});

export type PostReactionInput = z.infer<typeof postReactionSchema>;

export const reportContentSchema = z.object({
  entityType: z.enum(["POST", "COMMENT"]),
  entityId: z.string().min(1, "Entity ID is required"),
  reason: z.enum(REPORT_REASONS),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
});

export type ReportContentInput = z.infer<typeof reportContentSchema>;

export const communityFilterSchema = z.object({
  query: z.string().optional(),
  category: z.enum([...COMMUNITY_CATEGORIES, "ALL"]).optional().default("ALL"),
  tag: z.string().optional(),
  sortBy: z.enum(SORT_OPTIONS).optional().default("trending"),
});

export type CommunityFilterInput = z.infer<typeof communityFilterSchema>;
