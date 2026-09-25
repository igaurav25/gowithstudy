import { describe, it, expect } from "vitest";
import { CommunityService } from "@/services/community-service";

describe("Integration: Community Forum, Comments & Moderation Lifecycle", () => {
  const authorStudent = {
    id: "usr_community_author_01",
    name: "Tanvi Saxena",
    branch: "B.Tech CSE '26",
    avatarUrl: null,
  };

  const peerStudent = {
    id: "usr_community_peer_02",
    name: "Vikram Malhotra",
    branch: "B.Tech IT '26",
    avatarUrl: null,
  };

  let createdPostId = "";
  let createdCommentId = "";

  it("Step 1: Student should publish a community discussion post", async () => {
    const post = await CommunityService.createPost(
      authorStudent.id,
      authorStudent,
      {
        title: "How to prepare for System Design interviews as a college undergrad?",
        content: "Looking for recommendations on resources like Designing Data-Intensive Applications vs ByteByteGo.",
        category: "STUDY",
        tags: ["system-design", "interviews", "placements"],
      }
    );

    expect(post.id).toBeDefined();
    expect(post.userId).toBe(authorStudent.id);
    expect(post.authorName).toBe(authorStudent.name);
    expect(post.title).toContain("System Design");
    expect(post.upvotesCount).toBe(0);

    createdPostId = post.id;
  });

  it("Step 2: Peer student should upvote the discussion", async () => {
    const upvoteResult = await CommunityService.toggleUpvote(peerStudent.id, createdPostId);
    expect(upvoteResult.hasUpvoted).toBe(true);
    expect(upvoteResult.upvotesCount).toBe(1);

    // Toggling again should remove the upvote
    const removeUpvote = await CommunityService.toggleUpvote(peerStudent.id, createdPostId);
    expect(removeUpvote.hasUpvoted).toBe(false);
    expect(removeUpvote.upvotesCount).toBe(0);
  });

  it("Step 3: Peer student should add a comment to the post", async () => {
    const comment = await CommunityService.addComment(
      peerStudent.id,
      peerStudent,
      {
        postId: createdPostId,
        content: "DDIA is great for deep fundamentals, but Alex Xu's ByteByteGo is much more practical for interview formats!",
      }
    );

    expect(comment.id).toBeDefined();
    expect(comment.postId).toBe(createdPostId);
    expect(comment.userId).toBe(peerStudent.id);
    expect(comment.content).toContain("Alex Xu");

    createdCommentId = comment.id;
    expect(createdCommentId).toBeDefined();

    // Check post comment count updated
    const post = await CommunityService.getPostById(createdPostId);
    expect(post?.commentsCount).toBeGreaterThanOrEqual(1);
  });

  it("Step 4: Author should be able to update their post; Peer cannot update Author's post", async () => {
    // Peer attempt must fail
    await expect(
      CommunityService.updatePost(createdPostId, peerStudent.id, {
        title: "Tampered by non-author",
      })
    ).rejects.toThrow(/Unauthorized/);

    // Author update must succeed
    const updated = await CommunityService.updatePost(createdPostId, authorStudent.id, {
      title: "System Design for Undergrads — Curated Roadmap & Tips",
    });
    expect(updated.title).toContain("Curated Roadmap");
  });

  it("Step 5: Content Reporting workflow: report post for review", async () => {
    const report = await CommunityService.reportContent(peerStudent.id, {
      entityType: "POST",
      entityId: createdPostId,
      reason: "SPAM",
      description: "Flagged test report for moderation verification.",
    });

    expect(report.id).toBeDefined();
    expect(report.status).toBe("OPEN");
    expect(report.reporterId).toBe(peerStudent.id);
    expect(report.reason).toBe("SPAM");
  });

  it("Step 6: Moderation permissions: standard user cannot delete another's post; Moderator can", async () => {
    // Standard peer user attempting to delete another's post
    await expect(
      CommunityService.deletePost(createdPostId, peerStudent.id, "USER")
    ).rejects.toThrow(/Unauthorized/);

    // Moderator role deleting post
    const moderatorDeleted = await CommunityService.deletePost(
      createdPostId,
      "mod_admin_01",
      "MODERATOR"
    );
    expect(moderatorDeleted).toBe(true);

    const postAfterDelete = await CommunityService.getPostById(createdPostId);
    expect(postAfterDelete).toBeNull();
  });
});
