"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { CommunityService } from "@/services/community-service";
import {
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
  reportContentSchema,
  CreatePostInput,
  UpdatePostInput,
  CreateCommentInput,
  ReportContentInput,
} from "@/schemas/community";

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Publish a new community discussion post
 */
export async function createPostAction(
  input: CreatePostInput
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in to post." };
    }

    const parsed = createPostSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid post data",
      };
    }

    const created = await CommunityService.createPost(
      session.userId,
      {
        name: session.name,
        branch: `${session.role === "ADMIN" ? "Admin" : "Student"} • ${session.email.split("@")[0]}`,
      },
      parsed.data
    );

    revalidatePath("/dashboard/community");
    revalidatePath("/dashboard");
    return { success: true, data: created };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create discussion";
    return { success: false, error: message };
  }
}

/**
 * Update an existing post
 */
export async function updatePostAction(
  id: string,
  input: UpdatePostInput
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const parsed = updatePostSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid update data",
      };
    }

    const updated = await CommunityService.updatePost(
      id,
      session.userId,
      parsed.data
    );

    revalidatePath("/dashboard/community");
    revalidatePath(`/dashboard/community/${id}`);
    return { success: true, data: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update discussion";
    return { success: false, error: message };
  }
}

/**
 * Delete a post
 */
export async function deletePostAction(id: string): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const deleted = await CommunityService.deletePost(
      id,
      session.userId,
      session.role
    );

    if (!deleted) {
      return { success: false, error: "Post not found or unauthorized" };
    }

    revalidatePath("/dashboard/community");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete discussion";
    return { success: false, error: message };
  }
}

/**
 * Toggle Upvote on a post
 */
export async function togglePostReactionAction(
  postId: string
): Promise<ActionResponse<{ upvotesCount: number; hasUpvoted: boolean }>> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const result = await CommunityService.toggleUpvote(session.userId, postId);
    revalidatePath("/dashboard/community");
    revalidatePath(`/dashboard/community/${postId}`);
    return { success: true, data: result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update upvote";
    return { success: false, error: message };
  }
}

/**
 * Post a comment / reply to a discussion
 */
export async function createCommentAction(
  input: CreateCommentInput
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in to reply." };
    }

    const parsed = createCommentSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid reply content",
      };
    }

    const comment = await CommunityService.addComment(
      session.userId,
      {
        name: session.name,
        branch: `${session.role === "ADMIN" ? "Admin" : "Verified Student"}`,
      },
      parsed.data
    );

    revalidatePath("/dashboard/community");
    revalidatePath(`/dashboard/community/${input.postId}`);
    return { success: true, data: comment };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to post comment";
    return { success: false, error: message };
  }
}

/**
 * Delete a comment
 */
export async function deleteCommentAction(
  commentId: string,
  postId: string
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const deleted = await CommunityService.deleteComment(
      commentId,
      session.userId,
      session.role
    );

    if (!deleted) {
      return { success: false, error: "Comment not found or unauthorized" };
    }

    revalidatePath("/dashboard/community");
    revalidatePath(`/dashboard/community/${postId}`);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete comment";
    return { success: false, error: message };
  }
}

/**
 * Submit a moderation report
 */
export async function reportContentAction(
  input: ReportContentInput
): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const parsed = reportContentSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid report data",
      };
    }

    const report = await CommunityService.reportContent(
      session.userId,
      parsed.data
    );

    return { success: true, data: report };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit report";
    return { success: false, error: message };
  }
}
