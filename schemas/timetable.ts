import { z } from "zod";

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export const createTimetableEntrySchema = z.object({
  subject: z
    .string()
    .trim()
    .min(2, "Subject name must be at least 2 characters")
    .max(60, "Subject name cannot exceed 60 characters"),
  faculty: z.string().trim().max(60).optional().or(z.literal("")),
  day: z.enum(DAYS_OF_WEEK),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid start time format (HH:MM)"),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid end time format (HH:MM)"),
  room: z.string().trim().max(30).optional().or(z.literal("")),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
}).refine(
  (data) => {
    // Ensure startTime is before endTime
    const [startH, startM] = data.startTime.split(":").map(Number);
    const [endH, endM] = data.endTime.split(":").map(Number);
    return startH * 60 + startM < endH * 60 + endM;
  },
  {
    message: "Start time must be earlier than end time",
    path: ["endTime"],
  }
);

export type CreateTimetableEntryInput = z.infer<typeof createTimetableEntrySchema>;

export const updateTimetableEntrySchema = createTimetableEntrySchema.partial();
export type UpdateTimetableEntryInput = z.infer<typeof updateTimetableEntrySchema>;
