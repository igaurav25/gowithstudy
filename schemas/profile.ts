import { z } from "zod";
import { strongPasswordRegex } from "@/schemas/auth";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(60, "Full name must not exceed 60 characters"),
  college: z.string().min(2, "College name is required"),
  course: z.string().min(2, "Course is required"),
  branch: z.string().min(2, "Branch/Stream is required"),
  year: z.coerce.number().int().min(1).max(5),
  semester: z.coerce.number().int().min(1).max(10),
  bio: z.string().max(300, "Bio cannot exceed 300 characters").optional().default(""),
  skills: z.string().optional().default(""),
  github: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  portfolio: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(
        strongPasswordRegex,
        "Password must contain uppercase, lowercase, number, and special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const updatePreferencesSchema = z.object({
  emailNotifications: z.boolean().default(true),
  assignmentReminders: z.boolean().default(true),
  placementAlerts: z.boolean().default(true),
  themePreference: z.enum(["light", "dark", "system"]).default("system"),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
