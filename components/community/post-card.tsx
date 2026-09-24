"use client";

import * as React from "react";
import Link from "next/link";
import {
  Pin,
  ThumbsUp,
  MessageSquare,
  Eye,
  Share2,
  Flag,
  Trash2,
  MoreVertical,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CommunityPostItem } from "@/services/community-service";
import { CommunityCategory } from "@/schemas/community";

interface PostCardProps {
  post: CommunityPostItem;
  currentUserId: string;
  userRole?: string;
  onToggleUpvote: (postId: string) => void;
  onOpenReport: (postId: string, title: string) => void;
  onDeletePost: (postId: string) => void;
  onTagClick?: (tag: string) => void;
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

export function PostCard({
  post,
  currentUserId,
  userRole = "USER",
  onToggleUpvote,
  onOpenReport,
  onDeletePost,
  onTagClick,
}: PostCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const isOwner = post.userId === currentUserId || userRole === "ADMIN" || userRole === "MODERATOR";
  const catConfig = CATEGORY_STYLES[post.category] || {
    label: post.category,
    badgeVariant: "secondary",
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/dashboard/community/${post.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setMenuOpen(false);
  };

  return (
    <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-xs hover:border-indigo-500/40 hover:shadow-md hover:shadow-indigo-500/5 transition-all">
      {/* Top Header: Author, Category, Pinned, Menu */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
            {post.authorName ? post.authorName[0].toUpperCase() : "U"}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {post.authorName}
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {post.authorBranch}
              </span>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">•</span>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                {formatTimeAgo(post.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {post.isPinned && (
            <Badge variant="purple" className="flex items-center gap-1 text-[11px]">
              <Pin className="w-3 h-3 fill-violet-500 text-violet-500" />
              <span>Pinned</span>
            </Badge>
          )}

          <Badge variant={catConfig.badgeVariant} className="text-[11px]">
            {catConfig.label}
          </Badge>

          {/* Action Menu dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg py-1 z-30 animate-in fade-in zoom-in-95">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? "Link Copied!" : "Share Link"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenReport(post.id, post.title);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 flex items-center gap-2"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Report Content</span>
                  </button>

                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onDeletePost(post.id);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Post</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Post Title and Snippet */}
      <Link href={`/dashboard/community/${post.id}`} className="group block">
        <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug mb-2">
          {post.title}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-3">
          {post.content.replace(/###/g, "").replace(/```[\s\S]*?```/g, "[Code Snippet]")}
        </p>
      </Link>

      {/* Tags Chips */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          {post.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick?.(tag)}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Footer Metrics & Interactive Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/60 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-3">
          {/* Upvote Button */}
          <button
            type="button"
            onClick={() => onToggleUpvote(post.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
              post.hasUpvoted
                ? "bg-indigo-600 text-white shadow-xs shadow-indigo-500/20"
                : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400"
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${post.hasUpvoted ? "fill-white" : ""}`} />
            <span>{post.upvotesCount}</span>
          </button>

          {/* Comment Count / Thread Link */}
          <Link
            href={`/dashboard/community/${post.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-semibold transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
            <span>
              {post.commentsCount} {post.commentsCount === 1 ? "answer" : "answers"}
            </span>
          </Link>
        </div>

        {/* Views */}
        <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 text-[11px]">
          <Eye className="w-3.5 h-3.5" />
          <span>{post.viewsCount} views</span>
        </div>
      </div>
    </div>
  );
}
