"use server";

import { getSession } from "@/lib/auth";
import { NotesService, NoteItem } from "@/services/notes-service";
import {
  createNoteSchema,
  updateNoteSchema,
  updateNoteStatusSchema,
  CreateNoteInput,
  NoteStatus,
} from "@/schemas/notes";
import { ActionResult } from "@/features/auth/actions";
import { revalidatePath } from "next/cache";

/**
 * Server action to create a new study material / note
 */
export async function createNoteAction(
  input: CreateNoteInput
): Promise<ActionResult<NoteItem>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  const validation = createNoteSchema.safeParse(input);
  if (!validation.success) {
    const errors: Record<string, string> = {};
    for (const issue of validation.error.issues) {
      const field = issue.path[0] as string;
      if (!errors[field]) errors[field] = issue.message;
    }
    return { success: false, message: "Validation failed", errors };
  }

  try {
    const note = await NotesService.createNote(session.userId, validation.data);
    revalidatePath("/dashboard/notes");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Study note added successfully!",
      data: note,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to create note",
    };
  }
}

/**
 * Server action to update existing note
 */
export async function updateNoteAction(
  id: string,
  input: Partial<CreateNoteInput>
): Promise<ActionResult<NoteItem>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  const validation = updateNoteSchema.safeParse(input);
  if (!validation.success) {
    const errors: Record<string, string> = {};
    for (const issue of validation.error.issues) {
      const field = issue.path[0] as string;
      if (!errors[field]) errors[field] = issue.message;
    }
    return { success: false, message: "Validation failed", errors };
  }

  try {
    const updated = await NotesService.updateNote(id, session.userId, validation.data);
    revalidatePath("/dashboard/notes");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Note updated successfully!",
      data: updated,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to update note",
    };
  }
}

/**
 * Server action to quickly change note reading status
 */
export async function updateNoteStatusAction(
  id: string,
  status: NoteStatus
): Promise<ActionResult<NoteItem>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  const validation = updateNoteStatusSchema.safeParse({ status });
  if (!validation.success) {
    return { success: false, message: "Invalid status value" };
  }

  try {
    const updated = await NotesService.updateNoteStatus(
      id,
      session.userId,
      validation.data.status
    );
    revalidatePath("/dashboard/notes");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: `Status updated to ${status}`,
      data: updated,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to update status",
    };
  }
}

/**
 * Server action to toggle archive/unarchive note
 */
export async function toggleArchiveNoteAction(
  id: string
): Promise<ActionResult<NoteItem>> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  try {
    const updated = await NotesService.toggleArchiveNote(id, session.userId);
    revalidatePath("/dashboard/notes");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: updated.isArchived ? "Note moved to archive" : "Note unarchived",
      data: updated,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to toggle archive",
    };
  }
}

/**
 * Server action to delete a note permanently
 */
export async function deleteNoteAction(id: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized. Please sign in." };
  }

  try {
    const success = await NotesService.deleteNote(id, session.userId);
    if (!success) {
      return { success: false, message: "Note not found or already deleted" };
    }
    revalidatePath("/dashboard/notes");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Note deleted successfully!",
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to delete note",
    };
  }
}
