import { z } from "zod";

export const APPLICATION_STATUSES = [
  "SAVED",
  "APPLIED",
  "OA_SCHEDULED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const JOB_TYPES = [
  "INTERNSHIP",
  "FULL_TIME",
  "RESEARCH_INTERN",
  "PART_TIME",
] as const;
export type JobType = (typeof JOB_TYPES)[number];

export const WORK_MODES = ["REMOTE", "ON_SITE", "HYBRID"] as const;
export type WorkMode = (typeof WORK_MODES)[number];

export const createInternshipSchema = z.object({
  company: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name cannot exceed 100 characters"),
  role: z
    .string()
    .min(2, "Role title must be at least 2 characters")
    .max(100, "Role title cannot exceed 100 characters"),
  jobType: z.enum(JOB_TYPES, {
    message: "Please select a valid job type",
  }).default("INTERNSHIP"),
  workMode: z.enum(WORK_MODES, {
    message: "Please select a valid work mode",
  }).default("HYBRID"),
  location: z.string().max(100).optional().nullable(),
  jobUrl: z
    .string()
    .url("Please provide a valid URL")
    .or(z.literal(""))
    .optional()
    .nullable(),
  stipendOrSalary: z.string().max(60).optional().nullable(),
  applicationDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  status: z.enum(APPLICATION_STATUSES, {
    message: "Please select a valid status",
  }).default("APPLIED"),
  referralName: z.string().max(100).optional().nullable(),
  resumeVersion: z.string().max(100).optional().nullable(),
  notes: z.string().max(3000).optional().nullable(),
  recruiterContact: z.string().max(150).optional().nullable(),
});

export type CreateInternshipInput = z.infer<typeof createInternshipSchema>;

export const updateInternshipSchema = createInternshipSchema.partial();
export type UpdateInternshipInput = z.infer<typeof updateInternshipSchema>;

export const updateInternshipStatusSchema = z.object({
  status: z.enum(APPLICATION_STATUSES),
});

export const internshipFilterSchema = z.object({
  query: z.string().optional(),
  status: z.enum(["ALL", ...APPLICATION_STATUSES]).default("ALL"),
  jobType: z.enum(["ALL", ...JOB_TYPES]).default("ALL"),
  workMode: z.enum(["ALL", ...WORK_MODES]).default("ALL"),
  sortBy: z
    .enum(["applied_recent", "deadline_soon", "company", "status"])
    .default("applied_recent"),
});

export type InternshipFilterInput = z.infer<typeof internshipFilterSchema>;
