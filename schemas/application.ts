import { z } from "zod";

export const studentApplicationSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters")
    .trim(),
  email: z
    .string()
    .email("Please provide a valid email address")
    .trim()
    .toLowerCase(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number cannot exceed 15 digits")
    .trim(),
  college: z
    .string()
    .min(2, "College/University name is required")
    .max(150, "College name too long")
    .trim(),
  course: z
    .string()
    .min(2, "Course / Degree is required")
    .max(100)
    .trim(),
  branch: z
    .string()
    .min(2, "Branch / Specialization is required")
    .max(100)
    .trim(),
  year: z
    .number()
    .int()
    .min(1, "Academic year must be between 1 and 6")
    .max(6, "Academic year must be between 1 and 6"),
  rollNumber: z
    .string()
    .min(2, "Roll Number / Student ID is required")
    .max(50, "Roll Number cannot exceed 50 characters")
    .trim(),
  idProofUrl: z.string().optional(),
  turnstileToken: z.string().optional(),
});

export type StudentApplicationInput = z.infer<typeof studentApplicationSchema>;

export const teacherApplicationSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters")
    .trim(),
  email: z
    .string()
    .email("Please provide a valid institutional email address")
    .trim()
    .toLowerCase(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number cannot exceed 15 digits")
    .trim(),
  institution: z
    .string()
    .min(2, "Institution / College name is required")
    .max(150)
    .trim(),
  designation: z
    .string()
    .min(2, "Designation is required (e.g. Assistant Professor, HOD)")
    .max(100)
    .trim(),
  qualification: z
    .string()
    .min(2, "Highest qualification is required (e.g. M.Tech, Ph.D)")
    .max(100)
    .trim(),
  department: z
    .string()
    .min(2, "Department is required")
    .max(100)
    .trim(),
  experienceYears: z
    .number()
    .int()
    .min(0, "Years of experience cannot be negative")
    .max(60, "Years of experience cannot exceed 60"),
  teacherIdNumber: z.string().max(50).optional(),
  turnstileToken: z.string().optional(),
});

export type TeacherApplicationInput = z.infer<typeof teacherApplicationSchema>;

export const applicationLookupSchema = z.object({
  referenceId: z
    .string()
    .min(6, "Reference ID is required")
    .max(30, "Reference ID too long")
    .trim()
    .toUpperCase(),
  email: z
    .string()
    .email("Valid email address is required")
    .trim()
    .toLowerCase(),
});

export type ApplicationLookupInput = z.infer<typeof applicationLookupSchema>;
