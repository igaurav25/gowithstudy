"use server";

import { getSession } from "@/lib/auth";
import { ProfileService, StudentProfileData } from "@/services/profile-service";
import {
  updateProfileSchema,
  changePasswordSchema,
  updatePreferencesSchema,
} from "@/schemas/profile";
import { ActionResult } from "@/features/auth/actions";
import { revalidatePath } from "next/cache";

/**
 * Updates student profile academic and social fields.
 */
export async function updateProfileAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult<StudentProfileData>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  const rawData = {
    name: formData.get("name"),
    college: formData.get("college"),
    course: formData.get("course"),
    branch: formData.get("branch"),
    year: formData.get("year"),
    semester: formData.get("semester"),
    bio: formData.get("bio"),
    skills: formData.get("skills"),
    github: formData.get("github"),
    linkedin: formData.get("linkedin"),
    portfolio: formData.get("portfolio"),
  };

  const validation = updateProfileSchema.safeParse(rawData);
  if (!validation.success) {
    const errors: Record<string, string> = {};
    for (const issue of validation.error.issues) {
      const field = issue.path[0] as string;
      if (!errors[field]) errors[field] = issue.message;
    }
    return { success: false, errors };
  }

  try {
    const updated = await ProfileService.updateProfile(session.userId, validation.data);
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Profile updated successfully!",
      data: updated,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update profile.",
    };
  }
}

/**
 * Changes student password securely.
 */
export async function changePasswordAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  const rawData = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const validation = changePasswordSchema.safeParse(rawData);
  if (!validation.success) {
    const errors: Record<string, string> = {};
    for (const issue of validation.error.issues) {
      const field = issue.path[0] as string;
      if (!errors[field]) errors[field] = issue.message;
    }
    return { success: false, errors };
  }

  try {
    await ProfileService.changePassword(session.userId, validation.data);
    return {
      success: true,
      message: "Password changed successfully!",
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to change password.",
    };
  }
}

/**
 * Updates student notification preferences.
 */
export async function updatePreferencesAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  const rawData = {
    emailNotifications: formData.get("emailNotifications") === "on",
    assignmentReminders: formData.get("assignmentReminders") === "on",
    placementAlerts: formData.get("placementAlerts") === "on",
    themePreference: formData.get("themePreference") || "system",
  };

  const validation = updatePreferencesSchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, message: "Invalid preferences input." };
  }

  try {
    await ProfileService.updatePreferences(session.userId, validation.data);
    revalidatePath("/dashboard/profile");
    return {
      success: true,
      message: "Preferences updated successfully!",
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update preferences.",
    };
  }
}
