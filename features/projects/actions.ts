"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { ProjectsService } from "@/services/projects-service";
import {
  createProjectSchema,
  updateProjectSchema,
  createJoinRequestSchema,
  respondJoinRequestSchema,
  CreateProjectInput,
  UpdateProjectInput,
  CreateJoinRequestInput,
  RespondJoinRequestInput,
} from "@/schemas/projects";

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Publish a new project listing
 */
export async function createProjectAction(
  input: CreateProjectInput
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const parsed = createProjectSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid project data",
      };
    }

    const created = await ProjectsService.createProject(
      session.userId,
      {
        name: session.name,
        branch: `${session.role === "ADMIN" ? "Admin" : "Student"} • ${session.email.split("@")[0]}`,
      },
      parsed.data
    );

    revalidatePath("/dashboard/projects");
    revalidatePath("/dashboard");
    return { success: true, data: created };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create project listing";
    return { success: false, error: message };
  }
}

/**
 * Update project details (Owner only)
 */
export async function updateProjectAction(
  id: string,
  input: UpdateProjectInput
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const parsed = updateProjectSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid update data",
      };
    }

    const updated = await ProjectsService.updateProject(
      id,
      session.userId,
      parsed.data
    );

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${id}`);
    return { success: true, data: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update project";
    return { success: false, error: message };
  }
}

/**
 * Delete project listing
 */
export async function deleteProjectAction(id: string): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const deleted = await ProjectsService.deleteProject(
      id,
      session.userId,
      session.role
    );

    if (!deleted) {
      return { success: false, error: "Project not found or unauthorized" };
    }

    revalidatePath("/dashboard/projects");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete project";
    return { success: false, error: message };
  }
}

/**
 * Send an application / request to join a project
 */
export async function sendJoinRequestAction(
  input: CreateJoinRequestInput
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in to apply." };
    }

    const parsed = createJoinRequestSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid request information",
      };
    }

    const req = await ProjectsService.sendJoinRequest(
      session.userId,
      {
        name: session.name,
        branch: `${session.role === "ADMIN" ? "Admin" : "Verified Student"}`,
      },
      parsed.data
    );

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${input.projectId}`);
    return { success: true, data: req };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send join request";
    return { success: false, error: message };
  }
}

/**
 * Accept or Reject a join request (Owner only)
 */
export async function respondJoinRequestAction(
  input: RespondJoinRequestInput
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const parsed = respondJoinRequestSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid status response" };
    }

    await ProjectsService.respondJoinRequest(
      parsed.data.requestId,
      session.userId,
      parsed.data.status
    );

    revalidatePath("/dashboard/projects");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process request";
    return { success: false, error: message };
  }
}
