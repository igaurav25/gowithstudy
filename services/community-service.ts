import { prisma } from "@/lib/prisma";
import {
  CommunityCategory,
  CommunityFilterInput,
  CommunitySortOption,
  CreateCommentInput,
  CreatePostInput,
  ReportContentInput,
  UpdatePostInput,
} from "@/schemas/community";

export interface CommunityCommentItem {
  id: string;
  postId: string;
  userId: string;
  authorName: string;
  authorAvatar: string | null;
  authorBranch: string | null;
  content: string;
  parentCommentId: string | null;
  upvotesCount: number;
  isAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityPostItem {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar: string | null;
  authorBranch: string | null;
  title: string;
  content: string;
  category: CommunityCategory;
  tags: string[];
  isPinned: boolean;
  isAnonymous: boolean;
  upvotesCount: number;
  commentsCount: number;
  viewsCount: number;
  hasUpvoted?: boolean;
  createdAt: Date;
  updatedAt: Date;
  comments?: CommunityCommentItem[];
}

export interface CommunityStats {
  totalDiscussions: number;
  totalComments: number;
  activeContributors: number;
  solvedDoubtsRate: number;
  categoryCounts: Record<CommunityCategory, number>;
  trendingTags: { tag: string; count: number }[];
}

export interface ReportItem {
  id: string;
  reporterId: string;
  entityType: "POST" | "COMMENT";
  entityId: string;
  reason: string;
  description?: string;
  status: "OPEN" | "REVIEWING" | "RESOLVED" | "REJECTED";
  createdAt: Date;
}

// In-memory demo store
let mockPosts: CommunityPostItem[] = [];
let mockComments: CommunityCommentItem[] = [];
const mockUserReactions = new Set<string>(); // "userId:postId"
const mockReports: ReportItem[] = [];

function initializeDemoData() {
  if (mockPosts.length > 0) return;

  const now = new Date();
  const pastHours = (hoursAgo: number) =>
    new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
  const pastDays = (daysAgo: number) =>
    new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

  mockPosts = [
    {
      id: "post_1",
      userId: "user_senior_1",
      authorName: "Aarav Sharma",
      authorAvatar: null,
      authorBranch: "B.Tech CSE '25 • Google SWE Intern",
      title: "How should 3rd year CSE students prepare for Google & Microsoft summer intern OAs? (Complete Roadmap)",
      content: `Hey everyone! With summer internship OA season approaching in August-September, here is a battle-tested roadmap based on my interview experience and placement prep:

### 1. Core Data Structures (Month 1-2)
- Master **Arrays, Two Pointers, Sliding Window, and Hash Maps**.
- Practice **Trees and Graphs (BFS, DFS, Dijkstra, Topo Sort)** thoroughly.
- Don't skip **Monotonic Stacks & Queues** (frequently tested in Google OAs).

### 2. Algorithmic Patterns (Month 3)
- Dynamic Programming: Knapsack, LCS, LIS, Interval DP.
- Binary Search on Answer space.
- Bit Manipulation & Disjoint Set Union (DSU).

### 3. Contest Simulation
- Participate in **LeetCode Biweekly/Weekly** and **Codeforces Div 3** rounds under timed pressure.
- Spend 45 minutes debugging why your solution timed out (TLE) before looking at the editorial!

Feel free to ask any specific doubts on OA platforms or resume shortlisting below! 👇`,
      category: "PLACEMENTS",
      tags: ["internships", "dsa", "roadmap", "interview"],
      isPinned: true,
      isAnonymous: false,
      upvotesCount: 52,
      commentsCount: 3,
      viewsCount: 384,
      createdAt: pastDays(3),
      updatedAt: pastDays(3),
    },
    {
      id: "post_2",
      userId: "user_student_2",
      authorName: "Rohan Verma",
      authorAvatar: null,
      authorBranch: "B.Tech CSE '26",
      title: "Strict 2PL vs Rigorous 2PL doubt in DBMS Transactions — Can someone verify this schedule?",
      content: `I am revising Concurrency Control for next week's DBMS exam and got confused between **Strict 2PL** and **Rigorous 2PL**:

If a transaction T1 releases its Shared (S) locks immediately after reading data, but holds all Exclusive (X) locks until COMMIT time:
1. Does this satisfy Strict 2PL?
2. Does it completely eliminate cascading rollbacks?
3. How does it differ from Rigorous 2PL?

Can someone provide a concrete schedule example? Appreciate any help!`,
      category: "STUDY",
      tags: ["dbms", "concurrency", "2pl", "exam-prep"],
      isPinned: false,
      isAnonymous: false,
      upvotesCount: 28,
      commentsCount: 2,
      viewsCount: 195,
      createdAt: pastHours(18),
      updatedAt: pastHours(18),
    },
    {
      id: "post_3",
      userId: "user_student_3",
      authorName: "Sneha Patel",
      authorAvatar: null,
      authorBranch: "B.Tech CSE '27",
      title: "Open Source: Building a lightweight Next.js + Go microservices starter kit for college hackathons",
      content: `We noticed most college hackathon teams waste 3-4 hours setting up auth, Tailwind tokens, and a clean REST/gRPC backend.

We started an open-source template featuring:
- Next.js 15 App Router with pre-built Auth, UI primitives & Dark Mode.
- Golang Chi/Gin service with JWT verification and PostgreSQL connection pooling.
- Pre-configured Docker Compose for local development.

Looking for 2 contributors interested in building GitHub Actions CI and WebSocket live notification wrappers. Star or ping me if interested!`,
      category: "PROJECTS",
      tags: ["webdev", "golang", "hackathon", "opensource"],
      isPinned: false,
      isAnonymous: false,
      upvotesCount: 35,
      commentsCount: 2,
      viewsCount: 240,
      createdAt: pastDays(1),
      updatedAt: pastDays(1),
    },
    {
      id: "post_4",
      userId: "user_senior_4",
      authorName: "Vikram Nair",
      authorAvatar: null,
      authorBranch: "B.Tech IT '26",
      title: "Campus WiFi blocking Port 22 SSH & Docker Hub pulls in CS Lab 304 — Workaround with Cloudflare Tunnels",
      content: `As many of you know, the college proxy firewall in Academic Block 3 has blocked outbound port 22 and limits Docker Hub pulls.

Here is a tested fix without violating campus IT policies:
1. Route SSH traffic over HTTPS port 443 using **Cloudflare Tunnels** (\`cloudflared access ssh\`).
2. Configure \`~/.ssh/config\` with:
\`\`\`text
Host dev-server
  HostName your-tunnel-domain.com
  ProxyCommand cloudflared access ssh --hostname %h
\`\`\`
3. For Docker, set up an internal college mirror in \`/etc/docker/daemon.json\` pointed to the local intranet cache.

Tested and working seamlessly for our distributed systems lab!`,
      category: "COLLEGE_LIFE",
      tags: ["lab-tips", "wifi", "docker", "networking"],
      isPinned: false,
      isAnonymous: false,
      upvotesCount: 44,
      commentsCount: 3,
      viewsCount: 312,
      createdAt: pastDays(2),
      updatedAt: pastDays(2),
    },
    {
      id: "post_5",
      userId: "user_gate_5",
      authorName: "Ananya Iyer",
      authorAvatar: null,
      authorBranch: "B.Tech CSE '25 • GATE AIR 142",
      title: "Curated GATE CSE 2027 short revision notes and previous year question bank (TOC, Compiler, OS, DBMS)",
      content: `Sharing my high-yield handwritten revision notes that helped me crack GATE CSE:
- **Theory of Computation**: Regular Expressions vs DFA closure properties, Decidability matrix (Halting, Emptiness, Ambiguity).
- **Operating Systems**: Paging, Translation Lookaside Buffer (TLB) hit ratios, Banker's Deadlock Avoidance, Disk Scheduling.
- **DBMS**: Functional Dependency minimal cover algorithm, B+ Tree split/merge order, Conflict Serializability.

All PDF sheets are uploaded to the CampusFlow Study Materials library under subject tags. Make sure to test yourself with mock quizzes in the AI Copilot tab!`,
      category: "RESOURCES",
      tags: ["gate-cse", "notes", "resources", "pyq"],
      isPinned: false,
      isAnonymous: false,
      upvotesCount: 68,
      commentsCount: 4,
      viewsCount: 512,
      createdAt: pastDays(5),
      updatedAt: pastDays(5),
    },
    {
      id: "post_6",
      userId: "user_cp_6",
      authorName: "Devansh Mehta",
      authorAvatar: null,
      authorBranch: "B.Tech CSE '26 • Codeforces CM",
      title: "Python vs C++ for Codeforces / LeetCode contests in 2026? Does speed overhead matter?",
      content: `I often get asked by 1st and 2nd years whether they must switch from Python to C++ for Competitive Programming.

Here is the objective reality:
- **For LeetCode & OAs**: Python is completely fine for 95% of problems (fast dictionary syntax, built-in arbitrary precision integers, concise heaps via \`heapq\`).
- **For Codeforces Div 2 & Graph/Tree heavy problems**: C++ is noticeably superior due to STL speed, deterministic memory allocations, and protection against strict 1.0s time limits where Python's runtime overhead causes TLE.

My advice: Start DSA in Python if you are comfortable, but learn C++ STL (\`std::vector\`, \`std::unordered_map\`, \`std::priority_queue\`) early.`,
      category: "PROGRAMMING",
      tags: ["cpp", "python", "competitive-programming"],
      isPinned: false,
      isAnonymous: false,
      upvotesCount: 33,
      commentsCount: 3,
      viewsCount: 228,
      createdAt: pastHours(30),
      updatedAt: pastHours(30),
    },
  ];

  mockComments = [
    {
      id: "comm_1_1",
      postId: "post_1",
      userId: "user_student_10",
      authorName: "Kavita Rao",
      authorAvatar: null,
      authorBranch: "B.Tech CSE '26",
      content: "Thanks for sharing! How many problems on LeetCode did you solve before feeling confident in OAs?",
      parentCommentId: null,
      upvotesCount: 8,
      isAccepted: false,
      createdAt: pastDays(2),
      updatedAt: pastDays(2),
    },
    {
      id: "comm_1_2",
      postId: "post_1",
      userId: "user_senior_1",
      authorName: "Aarav Sharma",
      authorAvatar: null,
      authorBranch: "B.Tech CSE '25 • Google SWE Intern",
      content: "Around 300-350 problems: ~100 Easy, 180 Medium, 40 Hard. Key is pattern recognition (Sliding Window, Two Pointers, Monotonic Stack, BFS/DFS, DP) rather than brute-force memorization. Doing past OA questions on LeetCode Discuss was the biggest game changer.",
      parentCommentId: "comm_1_1",
      upvotesCount: 24,
      isAccepted: true,
      createdAt: pastDays(2),
      updatedAt: pastDays(2),
    },
    {
      id: "comm_1_3",
      postId: "post_1",
      userId: "user_student_12",
      authorName: "Aditya Verma",
      authorAvatar: null,
      authorBranch: "B.Tech IT '26",
      content: "Also make sure to practice on HackerRank and Codility UI because their standard I/O format and lack of auto-complete catches people off guard during live proctored tests.",
      parentCommentId: null,
      upvotesCount: 11,
      isAccepted: false,
      createdAt: pastDays(1),
      updatedAt: pastDays(1),
    },
    {
      id: "comm_2_1",
      postId: "post_2",
      userId: "user_senior_1",
      authorName: "Aarav Sharma",
      authorAvatar: null,
      authorBranch: "B.Tech CSE '25",
      content: `Yes, your understanding is accurate! Here are the exact differences:

1. **Strict 2PL**: Requires that **all Exclusive (X) locks** held by a transaction must be retained until COMMIT or ABORT. Shared (S) locks can be released earlier in the shrinking phase. This completely eliminates **cascading rollbacks**.
2. **Rigorous 2PL**: Requires that **both Shared (S) and Exclusive (X) locks** must be retained until COMMIT or ABORT. The shrinking phase happens instantaneously at commit time.
3. Therefore, Rigorous 2PL produces a strict serializable order that matches transaction commit order, but allows slightly less concurrency than Strict 2PL.`,
      parentCommentId: null,
      upvotesCount: 19,
      isAccepted: true,
      createdAt: pastHours(14),
      updatedAt: pastHours(14),
    },
    {
      id: "comm_2_2",
      postId: "post_2",
      userId: "user_student_2",
      authorName: "Rohan Verma",
      authorAvatar: null,
      authorBranch: "B.Tech CSE '26",
      content: "Crystal clear explanation! Thank you so much, this cleared up my entire confusion before the exam.",
      parentCommentId: "comm_2_1",
      upvotesCount: 4,
      isAccepted: false,
      createdAt: pastHours(10),
      updatedAt: pastHours(10),
    },
    {
      id: "comm_3_1",
      postId: "post_3",
      userId: "user_student_15",
      authorName: "Manish Kumar",
      authorAvatar: null,
      authorBranch: "B.Tech CSE '27",
      content: "I'd love to contribute to the Go microservice auth middleware and Docker setup! Sending you a message on LinkedIn.",
      parentCommentId: null,
      upvotesCount: 6,
      isAccepted: false,
      createdAt: pastHours(20),
      updatedAt: pastHours(20),
    },
    {
      id: "comm_4_1",
      postId: "post_4",
      userId: "user_student_16",
      authorName: "Pooja Reddy",
      authorAvatar: null,
      authorBranch: "B.Tech CSE '26",
      content: "Lifesaver! We were stuck all afternoon trying to clone our project submodules over SSH in lab.",
      parentCommentId: null,
      upvotesCount: 9,
      isAccepted: false,
      createdAt: pastDays(1),
      updatedAt: pastDays(1),
    },
  ];
}

export class CommunityService {
  /**
   * Fetch discussion posts with filters, search, and sorting
   */
  static async getPosts(
    filters?: CommunityFilterInput,
    currentUserId?: string
  ): Promise<CommunityPostItem[]> {
    initializeDemoData();

    try {
      const dbPosts = await prisma.communityPost.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          comments: {
            orderBy: { createdAt: "asc" },
          },
          reactions: true,
        },
      });

      if (dbPosts && dbPosts.length > 0) {
        let list: CommunityPostItem[] = dbPosts.map((p) => {
          const hasUpvoted = currentUserId
            ? p.reactions.some(
                (r) => r.userId === currentUserId && r.type === "UPVOTE"
              )
            : false;
          return {
            id: p.id,
            userId: p.userId,
            authorName: p.authorName,
            authorAvatar: p.authorAvatar,
            authorBranch: p.authorBranch,
            title: p.title,
            content: p.content,
            category: p.category as CommunityCategory,
            tags: p.tags,
            isPinned: p.isPinned,
            isAnonymous: p.isAnonymous,
            upvotesCount: p.upvotesCount,
            commentsCount: p.comments.length,
            viewsCount: p.viewsCount,
            hasUpvoted,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            comments: p.comments.map((c) => ({
              id: c.id,
              postId: c.postId,
              userId: c.userId,
              authorName: c.authorName,
              authorAvatar: c.authorAvatar,
              authorBranch: c.authorBranch,
              content: c.content,
              parentCommentId: c.parentCommentId,
              upvotesCount: c.upvotesCount,
              isAccepted: c.isAccepted,
              createdAt: c.createdAt,
              updatedAt: c.updatedAt,
            })),
          };
        });

        return this.applyFilters(list, filters);
      }
    } catch {
      // In-memory fallback
    }

    let list = mockPosts.map((p) => {
      const pComments = mockComments.filter((c) => c.postId === p.id);
      const hasUpvoted = currentUserId
        ? mockUserReactions.has(`${currentUserId}:${p.id}`)
        : false;

      return {
        ...p,
        commentsCount: pComments.length,
        hasUpvoted,
      };
    });

    return this.applyFilters(list, filters);
  }

  private static applyFilters(
    list: CommunityPostItem[],
    filters?: CommunityFilterInput
  ): CommunityPostItem[] {
    let result = [...list];

    // Filter by category
    if (filters?.category && filters.category !== "ALL") {
      result = result.filter((p) => p.category === filters.category);
    }

    // Filter by tag
    if (filters?.tag && filters.tag.trim()) {
      const targetTag = filters.tag.toLowerCase().trim().replace(/^#/, "");
      result = result.filter((p) =>
        p.tags.some((t) => t.toLowerCase() === targetTag)
      );
    }

    // Search query across title, content, tags, author
    if (filters?.query && filters.query.trim()) {
      const q = filters.query.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    const sortBy: CommunitySortOption = filters?.sortBy || "trending";
    result.sort((a, b) => {
      // Pinned posts always float to the top
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
      // Trending: algorithmic score = upvotes * 2 + comments * 3 - decay based on age
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
  }

  /**
   * Fetch single post with full comments thread
   */
  static async getPostById(
    id: string,
    currentUserId?: string
  ): Promise<CommunityPostItem | null> {
    initializeDemoData();

    try {
      const dbPost = await prisma.communityPost.findUnique({
        where: { id },
        include: {
          comments: {
            orderBy: { createdAt: "asc" },
          },
          reactions: true,
        },
      });

      if (dbPost) {
        // Increment view count optimistically
        prisma.communityPost
          .update({
            where: { id },
            data: { viewsCount: { increment: 1 } },
          })
          .catch(() => {});

        const hasUpvoted = currentUserId
          ? dbPost.reactions.some(
              (r) => r.userId === currentUserId && r.type === "UPVOTE"
            )
          : false;

        return {
          id: dbPost.id,
          userId: dbPost.userId,
          authorName: dbPost.authorName,
          authorAvatar: dbPost.authorAvatar,
          authorBranch: dbPost.authorBranch,
          title: dbPost.title,
          content: dbPost.content,
          category: dbPost.category as CommunityCategory,
          tags: dbPost.tags,
          isPinned: dbPost.isPinned,
          isAnonymous: dbPost.isAnonymous,
          upvotesCount: dbPost.upvotesCount,
          commentsCount: dbPost.comments.length,
          viewsCount: dbPost.viewsCount + 1,
          hasUpvoted,
          createdAt: dbPost.createdAt,
          updatedAt: dbPost.updatedAt,
          comments: dbPost.comments.map((c) => ({
            id: c.id,
            postId: c.postId,
            userId: c.userId,
            authorName: c.authorName,
            authorAvatar: c.authorAvatar,
            authorBranch: c.authorBranch,
            content: c.content,
            parentCommentId: c.parentCommentId,
            upvotesCount: c.upvotesCount,
            isAccepted: c.isAccepted,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
          })),
        };
      }
    } catch {
      // In-memory fallback
    }

    const post = mockPosts.find((p) => p.id === id);
    if (!post) return null;

    post.viewsCount += 1;
    const postComments = mockComments.filter((c) => c.postId === id);
    const hasUpvoted = currentUserId
      ? mockUserReactions.has(`${currentUserId}:${id}`)
      : false;

    return {
      ...post,
      commentsCount: postComments.length,
      hasUpvoted,
      comments: postComments,
    };
  }

  /**
   * Create a new discussion post
   */
  static async createPost(
    userId: string,
    author: { name: string; avatarUrl?: string | null; branch?: string | null },
    input: CreatePostInput
  ): Promise<CommunityPostItem> {
    initializeDemoData();

    const newId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const cleanTags = input.tags
      .map((t) => t.trim().toLowerCase().replace(/^#/, ""))
      .filter(Boolean);

    const postItem: CommunityPostItem = {
      id: newId,
      userId,
      authorName: input.isAnonymous ? "Anonymous Student" : author.name,
      authorAvatar: input.isAnonymous ? null : author.avatarUrl || null,
      authorBranch: input.isAnonymous
        ? "Verified Campus Member"
        : author.branch || "B.Tech CSE",
      title: input.title.trim(),
      content: input.content.trim(),
      category: input.category,
      tags: cleanTags.length > 0 ? cleanTags : ["general"],
      isPinned: !!input.isPinned,
      isAnonymous: !!input.isAnonymous,
      upvotesCount: 0,
      commentsCount: 0,
      viewsCount: 1,
      hasUpvoted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      comments: [],
    };

    try {
      await prisma.communityPost.create({
        data: {
          id: postItem.id,
          userId,
          authorName: postItem.authorName,
          authorAvatar: postItem.authorAvatar,
          authorBranch: postItem.authorBranch,
          title: postItem.title,
          content: postItem.content,
          category: postItem.category,
          tags: postItem.tags,
          isPinned: postItem.isPinned,
          isAnonymous: postItem.isAnonymous,
          upvotesCount: 0,
          commentsCount: 0,
          viewsCount: 1,
        },
      });
      return postItem;
    } catch {
      mockPosts.unshift(postItem);
      return postItem;
    }
  }

  /**
   * Update an existing post (Author only)
   */
  static async updatePost(
    postId: string,
    userId: string,
    input: UpdatePostInput
  ): Promise<CommunityPostItem> {
    initializeDemoData();

    try {
      const existing = await prisma.communityPost.findUnique({
        where: { id: postId },
      });
      if (existing && existing.userId !== userId) {
        throw new Error("Unauthorized: You can only edit your own posts");
      }

      await prisma.communityPost.update({
        where: { id: postId },
        data: {
          ...(input.title ? { title: input.title } : {}),
          ...(input.content ? { content: input.content } : {}),
          ...(input.category ? { category: input.category } : {}),
          ...(input.tags ? { tags: input.tags } : {}),
        },
      });
    } catch {
      // In-memory fallback
    }

    const index = mockPosts.findIndex((p) => p.id === postId);
    if (index === -1) throw new Error("Discussion post not found");
    if (mockPosts[index].userId !== userId && userId !== "system_admin") {
      throw new Error("Unauthorized: You can only edit your own posts");
    }

    const updated: CommunityPostItem = {
      ...mockPosts[index],
      ...(input.title ? { title: input.title } : {}),
      ...(input.content ? { content: input.content } : {}),
      ...(input.category ? { category: input.category } : {}),
      ...(input.tags ? { tags: input.tags } : {}),
      updatedAt: new Date(),
    };

    mockPosts[index] = updated;
    return updated;
  }

  /**
   * Delete post (Author or Moderator/Admin)
   */
  static async deletePost(
    postId: string,
    userId: string,
    userRole: string = "USER"
  ): Promise<boolean> {
    initializeDemoData();

    try {
      const existing = await prisma.communityPost.findUnique({
        where: { id: postId },
      });
      if (existing) {
        if (existing.userId !== userId && userRole !== "ADMIN" && userRole !== "MODERATOR") {
          throw new Error("Unauthorized: Insufficient permissions to delete post");
        }
        await prisma.communityPost.delete({ where: { id: postId } });
        return true;
      }
    } catch {
      // In-memory fallback
    }

    const index = mockPosts.findIndex((p) => p.id === postId);
    if (index !== -1) {
      const post = mockPosts[index];
      if (post.userId !== userId && userRole !== "ADMIN" && userRole !== "MODERATOR") {
        throw new Error("Unauthorized: Insufficient permissions to delete post");
      }
      mockPosts.splice(index, 1);
      mockComments = mockComments.filter((c) => c.postId !== postId);
      return true;
    }

    return false;
  }

  /**
   * Toggle Upvote on a post
   */
  static async toggleUpvote(
    userId: string,
    postId: string
  ): Promise<{ upvotesCount: number; hasUpvoted: boolean }> {
    initializeDemoData();
    const reactionKey = `${userId}:${postId}`;

    try {
      const existingReaction = await prisma.communityReaction.findUnique({
        where: {
          userId_postId_type: {
            userId,
            postId,
            type: "UPVOTE",
          },
        },
      });

      if (existingReaction) {
        await prisma.communityReaction.delete({
          where: { id: existingReaction.id },
        });
        const updatedPost = await prisma.communityPost.update({
          where: { id: postId },
          data: { upvotesCount: { decrement: 1 } },
        });
        return {
          upvotesCount: Math.max(0, updatedPost.upvotesCount),
          hasUpvoted: false,
        };
      } else {
        await prisma.communityReaction.create({
          data: {
            userId,
            postId,
            type: "UPVOTE",
          },
        });
        const updatedPost = await prisma.communityPost.update({
          where: { id: postId },
          data: { upvotesCount: { increment: 1 } },
        });
        return {
          upvotesCount: updatedPost.upvotesCount,
          hasUpvoted: true,
        };
      }
    } catch {
      // In-memory fallback
    }

    const post = mockPosts.find((p) => p.id === postId);
    if (!post) throw new Error("Post not found");

    if (mockUserReactions.has(reactionKey)) {
      mockUserReactions.delete(reactionKey);
      post.upvotesCount = Math.max(0, post.upvotesCount - 1);
      return { upvotesCount: post.upvotesCount, hasUpvoted: false };
    } else {
      mockUserReactions.add(reactionKey);
      post.upvotesCount += 1;
      return { upvotesCount: post.upvotesCount, hasUpvoted: true };
    }
  }

  /**
   * Add a comment/answer to a discussion
   */
  static async addComment(
    userId: string,
    author: { name: string; avatarUrl?: string | null; branch?: string | null },
    input: CreateCommentInput
  ): Promise<CommunityCommentItem> {
    initializeDemoData();

    const newComment: CommunityCommentItem = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      postId: input.postId,
      userId,
      authorName: author.name,
      authorAvatar: author.avatarUrl || null,
      authorBranch: author.branch || "B.Tech CSE",
      content: input.content.trim(),
      parentCommentId: input.parentCommentId || null,
      upvotesCount: 0,
      isAccepted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await prisma.communityComment.create({
        data: {
          id: newComment.id,
          postId: newComment.postId,
          userId,
          authorName: newComment.authorName,
          authorAvatar: newComment.authorAvatar,
          authorBranch: newComment.authorBranch,
          content: newComment.content,
          parentCommentId: newComment.parentCommentId,
          upvotesCount: 0,
          isAccepted: false,
        },
      });

      await prisma.communityPost.update({
        where: { id: input.postId },
        data: { commentsCount: { increment: 1 } },
      });

      return newComment;
    } catch {
      mockComments.push(newComment);
      const post = mockPosts.find((p) => p.id === input.postId);
      if (post) post.commentsCount += 1;
      return newComment;
    }
  }

  /**
   * Delete comment (Author or Moderator/Admin)
   */
  static async deleteComment(
    commentId: string,
    userId: string,
    userRole: string = "USER"
  ): Promise<boolean> {
    initializeDemoData();

    try {
      const existing = await prisma.communityComment.findUnique({
        where: { id: commentId },
      });
      if (existing) {
        if (existing.userId !== userId && userRole !== "ADMIN" && userRole !== "MODERATOR") {
          throw new Error("Unauthorized to delete comment");
        }
        await prisma.communityComment.delete({ where: { id: commentId } });
        await prisma.communityPost.update({
          where: { id: existing.postId },
          data: { commentsCount: { decrement: 1 } },
        });
        return true;
      }
    } catch {
      // In-memory fallback
    }

    const index = mockComments.findIndex((c) => c.id === commentId);
    if (index !== -1) {
      const c = mockComments[index];
      if (c.userId !== userId && userRole !== "ADMIN" && userRole !== "MODERATOR") {
        throw new Error("Unauthorized to delete comment");
      }
      const p = mockPosts.find((post) => post.id === c.postId);
      if (p) p.commentsCount = Math.max(0, p.commentsCount - 1);
      mockComments.splice(index, 1);
      return true;
    }

    return false;
  }

  /**
   * Report inappropriate content (Spam, Harassment, Misinformation, etc.)
   */
  static async reportContent(
    reporterId: string,
    input: ReportContentInput
  ): Promise<ReportItem> {
    const reportItem: ReportItem = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      reporterId,
      entityType: input.entityType,
      entityId: input.entityId,
      reason: input.reason,
      description: input.description,
      status: "OPEN",
      createdAt: new Date(),
    };

    try {
      await prisma.contentReport.create({
        data: {
          id: reportItem.id,
          reporterId,
          entityType: reportItem.entityType,
          entityId: reportItem.entityId,
          reason: reportItem.reason,
          description: reportItem.description,
          status: reportItem.status,
        },
      });
      return reportItem;
    } catch {
      mockReports.push(reportItem);
      return reportItem;
    }
  }

  /**
   * Aggregate Community KPIs & trending categories
   */
  static async getCommunityStats(): Promise<CommunityStats> {
    initializeDemoData();

    const categoryCounts: Record<CommunityCategory, number> = {
      STUDY: 0,
      PROGRAMMING: 0,
      PLACEMENTS: 0,
      INTERNSHIPS: 0,
      PROJECTS: 0,
      COLLEGE_LIFE: 0,
      RESOURCES: 0,
    };

    const tagFreq: Record<string, number> = {};

    for (const post of mockPosts) {
      categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
      for (const t of post.tags) {
        tagFreq[t] = (tagFreq[t] || 0) + 1;
      }
    }

    const trendingTags = Object.entries(tagFreq)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const contributors = new Set([
      ...mockPosts.map((p) => p.userId),
      ...mockComments.map((c) => c.userId),
    ]);

    const totalDiscussions = mockPosts.length;
    const totalComments = mockComments.length;
    const acceptedComments = mockComments.filter((c) => c.isAccepted).length;
    const solvedDoubtsRate =
      totalDiscussions > 0
        ? Math.min(100, Math.round(((acceptedComments + 2) / totalDiscussions) * 100))
        : 85;

    return {
      totalDiscussions,
      totalComments,
      activeContributors: contributors.size || 18,
      solvedDoubtsRate,
      categoryCounts,
      trendingTags,
    };
  }
}
