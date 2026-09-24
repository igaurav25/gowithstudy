"use client";

import * as React from "react";
import { MessageSquarePlus, Sparkles, Filter, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommunityHeader } from "@/components/community/community-header";
import { CommunityStatsBar } from "@/components/community/community-stats-bar";
import { CommunityCategoriesNav } from "@/components/community/community-categories-nav";
import { CommunityFilters } from "@/components/community/community-filters";
import { PostCard } from "@/components/community/post-card";
import { CreatePostModal } from "@/components/community/create-post-modal";
import { ReportModal } from "@/components/community/report-modal";
import {
  CommunityPostItem,
  CommunityStats,
} from "@/services/community-service";
import {
  CommunityCategory,
  CommunitySortOption,
  CreatePostInput,
} from "@/schemas/community";
import {
  createPostAction,
  deletePostAction,
  togglePostReactionAction,
} from "@/features/community/actions";

interface CommunityFeedViewProps {
  initialPosts: CommunityPostItem[];
  initialStats: CommunityStats;
  currentUserId: string;
  userRole?: string;
}

export function CommunityFeedView({
  initialPosts,
  initialStats,
  currentUserId,
  userRole = "USER",
}: CommunityFeedViewProps) {
  const [posts, setPosts] = React.useState<CommunityPostItem[]>(initialPosts);
  const [stats, setStats] = React.useState<CommunityStats>(initialStats);
  const [category, setCategory] = React.useState<CommunityCategory | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<CommunitySortOption>("trending");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [reportState, setReportState] = React.useState<{
    isOpen: boolean;
    entityId: string;
    entityTitle: string;
  }>({
    isOpen: false,
    entityId: "",
    entityTitle: "",
  });

  // Filtered and sorted posts
  const filteredPosts = React.useMemo(() => {
    let result = [...posts];

    if (category !== "ALL") {
      result = result.filter((p) => p.category === category);
    }

    if (selectedTag) {
      const cleanTag = selectedTag.toLowerCase().replace(/^#/, "");
      result = result.filter((p) =>
        p.tags.some((t) => t.toLowerCase() === cleanTag)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortBy === "top_voted") {
        return b.upvotesCount - a.upvotesCount;
      }
      if (sortBy === "most_discussed") {
        return b.commentsCount - a.commentsCount;
      }
      if (sortBy === "recent") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // Trending
      const score = (p: CommunityPostItem) => {
        const hoursAgo = Math.max(
          1,
          (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60)
        );
        return (p.upvotesCount * 2 + p.commentsCount * 3 + p.viewsCount * 0.1) / Math.pow(hoursAgo + 2, 0.8);
      };
      return score(b) - score(a);
    });

    return result;
  }, [posts, category, selectedTag, searchQuery, sortBy]);

  // Handle Optimistic Upvote
  const handleToggleUpvote = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newHasUpvoted = !p.hasUpvoted;
          const newCount = newHasUpvoted
            ? p.upvotesCount + 1
            : Math.max(0, p.upvotesCount - 1);
          return {
            ...p,
            hasUpvoted: newHasUpvoted,
            upvotesCount: newCount,
          };
        }
        return p;
      })
    );

    try {
      await togglePostReactionAction(postId);
    } catch {
      // Revert if error
      setPosts(initialPosts);
    }
  };

  // Handle Create Post
  const handleCreatePost = async (input: CreatePostInput) => {
    const res = await createPostAction(input);
    if (res.success && res.data) {
      const newPost = res.data as CommunityPostItem;
      setPosts((prev) => [newPost, ...prev]);
      setStats((prev) => ({
        ...prev,
        totalDiscussions: prev.totalDiscussions + 1,
        categoryCounts: {
          ...prev.categoryCounts,
          [newPost.category]: (prev.categoryCounts[newPost.category] || 0) + 1,
        },
      }));
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  // Handle Delete Post
  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this discussion?")) return;

    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setStats((prev) => ({
      ...prev,
      totalDiscussions: Math.max(0, prev.totalDiscussions - 1),
    }));

    await deletePostAction(postId);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <CommunityHeader
        onOpenCreateModal={() => setIsCreateOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 2. KPI Stats */}
      <CommunityStatsBar stats={stats} />

      {/* 3. Category Selector */}
      <div className="space-y-3 pt-2">
        <CommunityCategoriesNav
          selectedCategory={category}
          onSelectCategory={(cat) => {
            setCategory(cat);
            setSelectedTag(null);
          }}
          categoryCounts={stats.categoryCounts}
        />

        {/* 4. Sort and Tags Filter Bar */}
        <CommunityFilters
          sortBy={sortBy}
          onSortChange={setSortBy}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          trendingTags={stats.trendingTags}
        />
      </div>

      {/* 5. Discussions Feed */}
      {filteredPosts.length > 0 ? (
        <div className="space-y-4 pt-2">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              userRole={userRole}
              onToggleUpvote={handleToggleUpvote}
              onOpenReport={(id, title) =>
                setReportState({ isOpen: true, entityId: id, entityTitle: title })
              }
              onDeletePost={handleDeletePost}
              onTagClick={(tag) => setSelectedTag(tag)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              No discussions found
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              {searchQuery || selectedTag || category !== "ALL"
                ? "No questions match your current search or category filter. Try clearing filters or asking the first doubt!"
                : "No community questions have been posted yet. Start the conversation!"}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {(searchQuery || selectedTag || category !== "ALL") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTag(null);
                  setCategory("ALL");
                }}
              >
                Reset Filters
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-medium"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Ask First Doubt</span>
            </Button>
          </div>
        </div>
      )}

      {/* 6. Modals */}
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreatePost}
      />

      <ReportModal
        isOpen={reportState.isOpen}
        onClose={() =>
          setReportState({ isOpen: false, entityId: "", entityTitle: "" })
        }
        entityType="POST"
        entityId={reportState.entityId}
        entityTitle={reportState.entityTitle}
      />
    </div>
  );
}
