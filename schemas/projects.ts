import { z } from "zod";

export const PROJECT_TYPES = [
  "HACKATHON",
  "CAPSTONE",
  "OPEN_SOURCE",
  "RESEARCH",
  "STARTUP",
  "PRACTICE",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export const PROJECT_STATUSES = [
  "RECRUITING",
  "IN_PROGRESS",
  "COMPLETED",
  "ON_HOLD",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const JOIN_REQUEST_STATUSES = ["PENDING", "ACCEPTED", "REJECTED"] as const;
export type JoinRequestStatus = (typeof JOIN_REQUEST_STATUSES)[number];

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(3000, "Description cannot exceed 3000 characters"),
  projectType: z.enum(PROJECT_TYPES),
  techStack: z
    .array(z.string().trim().min(1).max(30))
    .min(1, "Please specify at least 1 technology in the stack")
    .max(10, "Maximum 10 technologies allowed"),
  requiredSkills: z
    .array(z.string().trim().min(1).max(30))
    .min(1, "Please specify at least 1 required skill")
    .max(10, "Maximum 10 skills allowed"),
  targetTeamSize: z.coerce
    .number()
    .int()
    .min(2, "Target team size must be at least 2 members")
    .max(10, "Target team size cannot exceed 10 members"),
  currentTeamSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(10)
    .optional(),
  rolesNeeded: z
    .array(z.string().trim().min(1).max(40))
    .min(1, "Please specify at least one role needed (e.g. Frontend Dev)")
    .max(6, "Maximum 6 open roles"),
  status: z.enum(PROJECT_STATUSES).optional(),
  deadline: z.string().optional().nullable(),
  githubUrl: z
    .string()
    .url("Please provide a valid URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  contactInfo: z.string().max(100).optional().nullable(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial();
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const createJoinRequestSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  roleApplied: z.string().min(2, "Please select the role you are applying for"),
  message: z
    .string()
    .min(5, "Please provide a brief intro or why you'd like to join (min 5 chars)")
    .max(1000, "Message cannot exceed 1000 characters"),
  portfolioOrGithub: z
    .string()
    .url("Please provide a valid GitHub or portfolio URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  skills: z.array(z.string()).optional().default([]),
});

export type CreateJoinRequestInput = z.infer<typeof createJoinRequestSchema>;

export const respondJoinRequestSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  status: z.enum(["ACCEPTED", "REJECTED"]),
});

export type RespondJoinRequestInput = z.infer<typeof respondJoinRequestSchema>;

export const projectFilterSchema = z.object({
  query: z.string().optional(),
  projectType: z.enum([...PROJECT_TYPES, "ALL"]).optional().default("ALL"),
  status: z.enum([...PROJECT_STATUSES, "ALL"]).optional().default("ALL"),
  tech: z.string().optional(),
  sortBy: z.enum(["recent", "spots_open", "team_size"]).optional().default("recent"),
});

export type ProjectFilterInput = z.infer<typeof projectFilterSchema>;
