"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pin,
  ThumbsUp,
  MessageSquare,
  Eye,
  Share2,
  Flag,
  Trash2,
  Send,
  CheckCircle2,
  Check,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReportModal } from "@/components/community/report-modal";
import {
  CommunityPostItem,
  CommunityCommentItem,
} from "@/services/community-service";
import { CommunityCategory } from "@/schemas/community";
import {
  createCommentAction,
  deleteCommentAction,
  deletePostAction,
  togglePostReactionAction,
} from "@/features/community/actions";

interface PostDetailClientViewProps {
  initialPost: CommunityPostItem;
  currentUserId: string;
  userRole?: string;
}

const CATEGORY_STYLES: Record<
  CommunityCategory,
  { label: string; badgeVariant: "purple" | "success" | "warning" | "destructive" | "secondary" | "outline" | "default" }
> = {
  STUDY: { label: "Academics", badgeVariant: "purple" },
  PROGRAMMING: { label: "Programming", badgeVariant: "success" },
  PLACEMENTS: { label: "Placements", badgeVariant: "default" },
  INTERNSHIPS: { label: "Internships", badgeVariant: "secondary" },
  PROJECTS: { label: "Projects", badgeVariant: "warning" },
  COLLEGE_LIFE: { label: "Campus Life", badgeVariant: "destructive" },
  RESOURCES: { label: "Resources", badgeVariant: "outline" },
};

function formatTimeAgo(dateInput: Date | string): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function PostDetailClientView({
  initialPost,
  currentUserId,
  userRole = "USER",
}: PostDetailClientViewProps) {
  const router = useRouter();
  const [post, setPost] = React.useState<CommunityPostItem>(initialPost);
  const [comments, setComments] = React.useState<CommunityCommentItem[]>(
    initialPost.comments || []
  );
  const [newComment, setNewComment] = React.useState("");
  const [submittingComment, setSubmittingComment] = React.useState(false);
  const [commentError, setCommentError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Report state
  const [reportState, setReportState] = React.useState<{
    isOpen: boolean;
    entityType: "POST" | "COMMENT";
    entityId: string;
    entityTitle: string;
  }>({
    isOpen: false,
    entityType: "POST",
    entityId: "",
    entityTitle: "",
  });

  const isPostOwner =
    post.userId === currentUserId || userRole === "ADMIN" || userRole === "MODERATOR";
  const catConfig = CATEGORY_STYLES[post.category] || {
    label: post.category,
    badgeVariant: "secondary",
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Upvote post
  const handleToggleUpvote = async () => {
    const newHasUpvoted = !post.hasUpvoted;
    const newCount = newHasUpvoted
      ? post.upvotesCount + 1
      : Math.max(0, post.upvotesCount - 1);

    setPost((prev) => ({
      ...prev,
      hasUpvoted: newHasUpvoted,
      upvotesCount: newCount,
    }));

    try {
      await togglePostReactionAction(post.id);
    } catch {
      setPost(initialPost);
    }
  };

  // Submit reply
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim().length < 2) return;

    setSubmittingComment(true);
    setCommentError(null);

    try {
      const res = await createCommentAction({
        postId: post.id,
        content: newComment.trim(),
      });

      if (res.success && res.data) {
        const added = res.data as CommunityCommentItem;
        setComments((prev) => [...prev, added]);
        setPost((prev) => ({ ...prev, commentsCount: prev.commentsCount + 1 }));
        setNewComment("");
      } else {
        setCommentError(res.error || "Failed to post answer");
      }
    } catch (err: unknown) {
      setCommentError(
        err instanceof Error ? err.message : "Failed to post answer"
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this reply?")) return;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setPost((prev) => ({
      ...prev,
      commentsCount: Math.max(0, prev.commentsCount - 1),
    }));
    await deleteCommentAction(commentId, post.id);
  };

  // Delete entire post
  const handleDeletePost = async () => {
    if (!confirm("Are you sure you want to delete this entire discussion?"))
      return;
    const res = await deletePostAction(post.id);
    if (res.success) {
      router.push("/dashboard/community");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/community"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Discussions</span>
        </Link>
      </div>

      {/* Main Post Container */}
      <article className="p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-sm space-y-6">
        {/* Top Meta Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
              {post.authorName ? post.authorName[0].toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-50">
                  {post.authorName}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {post.authorBranch}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                <span>Posted {formatTimeAgo(post.createdAt)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {post.viewsCount} views
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {post.isPinned && (
              <Badge variant="purple" className="flex items-center gap-1 text-xs">
                <Pin className="w-3.5 h-3.5 fill-violet-500 text-violet-500" />
                <span>Pinned</span>
              </Badge>
            )}
            <Badge variant={catConfig.badgeVariant} className="text-xs">
              {catConfig.label}
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-8 px-2.5 text-xs gap-1.5"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>{copied ? "Copied" : "Share"}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setReportState({
                  isOpen: true,
                  entityType: "POST",
                  entityId: post.id,
                  entityTitle: post.title,
                })
              }
              className="h-8 px-2 text-zinc-400 hover:text-amber-600 hover:bg-amber-500/10"
              title="Report content"
            >
              <Flag className="w-4 h-4" />
            </Button>

            {isPostOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeletePost}
                className="h-8 px-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-500/10"
                title="Delete discussion"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Discussion Title */}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-snug">
          {post.title}
        </h1>

        {/* Post Content with Clean Typography */}
        <div className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-wrap">
          {post.content}
        </div>

        {/* Tag pills */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Interactive Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
          <button
            type="button"
            onClick={handleToggleUpvote}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
              post.hasUpvoted
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400"
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${post.hasUpvoted ? "fill-white" : ""}`} />
            <span>Upvote ({post.upvotesCount})</span>
          </button>

          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            <span>{comments.length} Answers</span>
          </span>
        </div>
      </article>

      {/* Answers / Comments Section */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <span>Peer Answers & Discussion</span>
            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {comments.length}
            </span>
          </h2>
        </div>

        {/* Compose Answer Form */}
        <form
          onSubmit={handleAddComment}
          className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-xs space-y-3"
        >
          {commentError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{commentError}</span>
            </div>
          )}

          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Write an Answer or Follow-up Doubt
          </label>
          <textarea
            rows={4}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share an explanation, code snippet, or verified reference to help resolve this doubt..."
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-y"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-zinc-400">
              Remember to maintain constructive academic etiquette.
            </span>
            <Button
              type="submit"
              disabled={submittingComment || newComment.trim().length < 2}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium gap-2 text-xs h-9 px-4"
            >
              {submittingComment ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Post Answer</span>
            </Button>
          </div>
        </form>

        {/* Comments Feed */}
        {comments.length > 0 ? (
          <div className="space-y-3 pt-2">
            {comments.map((c) => {
              const isCommentOwner =
                c.userId === currentUserId ||
                userRole === "ADMIN" ||
                userRole === "MODERATOR";

              return (
                <div
                  key={c.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    c.isAccepted
                      ? "border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-xs"
                      : "border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold text-xs flex items-center justify-center shrink-0">
                        {c.authorName ? c.authorName[0].toUpperCase() : "U"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {c.authorName}
                          </span>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {c.authorBranch}
                          </span>
                          <span className="text-[11px] text-zinc-400">•</span>
                          <span className="text-[11px] text-zinc-400">
                            {formatTimeAgo(c.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {c.isAccepted && (
                        <Badge variant="success" className="text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Accepted Solution</span>
                        </Badge>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setReportState({
                            isOpen: true,
                            entityType: "COMMENT",
                            entityId: c.id,
                            entityTitle: c.content.slice(0, 50),
                          })
                        }
                        className="p-1 rounded-md text-zinc-400 hover:text-amber-600 hover:bg-amber-500/10"
                        title="Report reply"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>

                      {isCommentOwner && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(c.id)}
                          className="p-1 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-500/10"
                          title="Delete reply"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Comment Body */}
                  <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap pl-10">
                    {c.content}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-500 space-y-2">
            <MessageSquare className="w-6 h-6 mx-auto text-zinc-400" />
            <p className="text-xs">
              No replies posted yet. Be the first peer to provide an answer!
            </p>
          </div>
        )}
      </section>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportState.isOpen}
        onClose={() =>
          setReportState({
            isOpen: false,
            entityType: "POST",
            entityId: "",
            entityTitle: "",
          })
        }
        entityType={reportState.entityType}
        entityId={reportState.entityId}
        entityTitle={reportState.entityTitle}
      />
    </div>
  );
}
