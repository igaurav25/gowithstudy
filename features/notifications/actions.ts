"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { NotificationsService } from "@/services/notifications-service";
import {
  updateNotificationPreferencesSchema,
  createNotificationSchema,
  UpdateNotificationPreferencesInput,
  CreateNotificationInput,
} from "@/schemas/notifications";

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Mark a single notification as read
 */
export async function markAsReadAction(
  notificationId: string,
  read: boolean = true
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    if (!notificationId) {
      return { success: false, error: "Notification ID is required" };
    }

    const updated = await NotificationsService.markAsRead(
      notificationId,
      session.userId,
      read
    );

    revalidatePath("/dashboard/notifications");
    revalidatePath("/dashboard");
    return { success: updated };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update notification status";
    return { success: false, error: message };
  }
}

/**
 * Mark all notifications as read for current user
 */
export async function markAllAsReadAction(): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const count = await NotificationsService.markAllAsRead(session.userId);

    revalidatePath("/dashboard/notifications");
    revalidatePath("/dashboard");
    return { success: true, data: { markedCount: count } };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to mark all as read";
    return { success: false, error: message };
  }
}

/**
 * Delete a single notification
 */
export async function deleteNotificationAction(
  notificationId: string
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    if (!notificationId) {
      return { success: false, error: "Notification ID is required" };
    }

    const deleted = await NotificationsService.deleteNotification(
      notificationId,
      session.userId
    );

    revalidatePath("/dashboard/notifications");
    revalidatePath("/dashboard");
    return { success: deleted };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to delete notification";
    return { success: false, error: message };
  }
}

/**
 * Clear all read notifications
 */
export async function clearReadNotificationsAction(): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const cleared = await NotificationsService.clearReadNotifications(session.userId);

    revalidatePath("/dashboard/notifications");
    revalidatePath("/dashboard");
    return { success: true, data: { clearedCount: cleared } };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to clear notifications";
    return { success: false, error: message };
  }
}

/**
 * Update user notification preferences
 */
export async function updateNotificationPreferencesAction(
  input: UpdateNotificationPreferencesInput
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const parsed = updateNotificationPreferencesSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid preference data",
      };
    }

    const updated = await NotificationsService.updatePreferences(
      session.userId,
      parsed.data
    );

    revalidatePath("/dashboard/notifications");
    return { success: true, data: updated };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update preferences";
    return { success: false, error: message };
  }
}

/**
 * Trigger/Create notification (internal or test trigger)
 */
export async function createNotificationAction(
  input: CreateNotificationInput
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const parsed = createNotificationSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid notification data",
      };
    }

    const created = await NotificationsService.createNotification(
      session.userId,
      parsed.data
    );

    revalidatePath("/dashboard/notifications");
    revalidatePath("/dashboard");
    return { success: true, data: created };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create notification";
    return { success: false, error: message };
  }
}
