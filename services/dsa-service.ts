import {
  DSACategory,
  DSADifficulty,
  DSAPlatform,
  DSAStatus,
  DSA_CATEGORIES,
  DSA_DIFFICULTIES,
  CreateDSAProblemInput,
  UpdateDSAProblemInput,
  DSAFilterInput,
} from "@/schemas/dsa";

export interface DSAProblemItem {
  id: string;
  userId: string;
  title: string;
  category: DSACategory;
  difficulty: DSADifficulty;
  platform: DSAPlatform;
  problemUrl: string | null;
  timeComplexity: string | null;
  spaceComplexity: string | null;
  companyTags: string[];
  notes: string | null;
  solutionCode: string | null;
  status: DSAStatus;
  isRevision: boolean;
  solvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DSAStats {
  totalSolved: number;
  totalProblems: number;
  completionRate: number;
  streakDays: number;
  revisionCount: number;
  difficultyStats: {
    easy: { solved: number; total: number; pct: number };
    medium: { solved: number; total: number; pct: number };
    hard: { solved: number; total: number; pct: number };
  };
  categories: {
    name: DSACategory;
    solved: number;
    total: number;
    pct: number;
  }[];
}

// In-memory store per user (fallback & demo)
const mockDSAStore = new Map<string, DSAProblemItem[]>();

function getInitialDemoProblems(userId: string): DSAProblemItem[] {
  const now = new Date();
  const pastDay = (daysAgo: number) =>
    new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

  return [
    // Arrays & Strings
    {
      id: "dsa_prob_1",
      userId,
      title: "Two Sum",
      category: "Arrays & Strings",
      difficulty: "EASY",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/two-sum/",
      timeComplexity: "O(N)",
      spaceComplexity: "O(N)",
      companyTags: ["Google", "Amazon", "Microsoft", "Meta"],
      notes: "Use Hash Map to store complement (target - num). Single pass lookup.",
      solutionCode: `function twoSum(nums: number[], target: number): number[] {\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement)!, i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
      status: "SOLVED",
      isRevision: false,
      solvedAt: pastDay(8),
      createdAt: pastDay(15),
      updatedAt: pastDay(8),
    },
    {
      id: "dsa_prob_2",
      userId,
      title: "Best Time to Buy and Sell Stock",
      category: "Arrays & Strings",
      difficulty: "EASY",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
      companyTags: ["Amazon", "Microsoft", "Adobe"],
      notes: "Keep track of minPrice seen so far and maxProfit = max(maxProfit, price - minPrice).",
      solutionCode: null,
      status: "SOLVED",
      isRevision: false,
      solvedAt: pastDay(6),
      createdAt: pastDay(14),
      updatedAt: pastDay(6),
    },
    {
      id: "dsa_prob_3",
      userId,
      title: "Maximum Subarray (Kadane's Algorithm)",
      category: "Arrays & Strings",
      difficulty: "MEDIUM",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/maximum-subarray/",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
      companyTags: ["Microsoft", "Amazon", "LinkedIn"],
      notes: "Kadane's: currentSum = max(num, currentSum + num), maxSum = max(maxSum, currentSum).",
      solutionCode: `int maxSubArray(vector<int>& nums) {\n  int currentSum = 0, maxSum = nums[0];\n  for (int x : nums) {\n    currentSum = max(x, currentSum + x);\n    maxSum = max(maxSum, currentSum);\n  }\n  return maxSum;\n}`,
      status: "SOLVED",
      isRevision: true,
      solvedAt: pastDay(4),
      createdAt: pastDay(12),
      updatedAt: pastDay(4),
    },
    {
      id: "dsa_prob_4",
      userId,
      title: "3Sum",
      category: "Arrays & Strings",
      difficulty: "MEDIUM",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/3sum/",
      timeComplexity: "O(N^2)",
      spaceComplexity: "O(1)",
      companyTags: ["Meta", "Amazon", "Apple", "Google"],
      notes: "Sort array first, iterate pivot i, then use two pointers (left & right). Remember to skip duplicate values.",
      solutionCode: null,
      status: "REVISION_NEEDED",
      isRevision: true,
      solvedAt: null,
      createdAt: pastDay(10),
      updatedAt: pastDay(3),
    },
    {
      id: "dsa_prob_5",
      userId,
      title: "Longest Substring Without Repeating Characters",
      category: "Arrays & Strings",
      difficulty: "MEDIUM",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
      timeComplexity: "O(N)",
      spaceComplexity: "O(min(M, N))",
      companyTags: ["Amazon", "Google", "Microsoft"],
      notes: "Sliding window with hash map of last seen indices. When duplicate found, jump left pointer to map.get(ch) + 1.",
      solutionCode: null,
      status: "SOLVED",
      isRevision: false,
      solvedAt: pastDay(5),
      createdAt: pastDay(11),
      updatedAt: pastDay(5),
    },

    // Linked Lists
    {
      id: "dsa_prob_6",
      userId,
      title: "Reverse Linked List",
      category: "Linked Lists",
      difficulty: "EASY",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/reverse-linked-list/",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
      companyTags: ["Microsoft", "Google", "Amazon"],
      notes: "Three pointers: prev, curr, next. Iteratively reverse pointers.",
      solutionCode: `ListNode* reverseList(ListNode* head) {\n  ListNode *prev = nullptr, *curr = head;\n  while (curr) {\n    ListNode *nxt = curr->next;\n    curr->next = prev;\n    prev = curr;\n    curr = nxt;\n  }\n  return prev;\n}`,
      status: "SOLVED",
      isRevision: false,
      solvedAt: pastDay(7),
      createdAt: pastDay(12),
      updatedAt: pastDay(7),
    },
    {
      id: "dsa_prob_7",
      userId,
      title: "Merge Two Sorted Lists",
      category: "Linked Lists",
      difficulty: "EASY",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/merge-two-sorted-lists/",
      timeComplexity: "O(N + M)",
      spaceComplexity: "O(1)",
      companyTags: ["Amazon", "Apple", "Microsoft"],
      notes: "Dummy node technique with two pointers advancing through both lists.",
      solutionCode: null,
      status: "SOLVED",
      isRevision: false,
      solvedAt: pastDay(6),
      createdAt: pastDay(12),
      updatedAt: pastDay(6),
    },
    {
      id: "dsa_prob_8",
      userId,
      title: "Linked List Cycle (Floyd's Tortoise & Hare)",
      category: "Linked Lists",
      difficulty: "EASY",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/linked-list-cycle/",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
      companyTags: ["Microsoft", "Oracle", "Cisco"],
      notes: "Slow pointer moves 1 step, fast pointer moves 2 steps. If they meet, a cycle exists.",
      solutionCode: null,
      status: "SOLVED",
      isRevision: false,
      solvedAt: pastDay(5),
      createdAt: pastDay(10),
      updatedAt: pastDay(5),
    },
    {
      id: "dsa_prob_9",
      userId,
      title: "LRU Cache Design",
      category: "Linked Lists",
      difficulty: "MEDIUM",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/lru-cache/",
      timeComplexity: "O(1) get & put",
      spaceComplexity: "O(Capacity)",
      companyTags: ["Google", "Amazon", "Meta", "Microsoft"],
      notes: "Doubly Linked List + Hash Map pointing to node pointers for O(1) removals & promotions.",
      solutionCode: null,
      status: "REVISION_NEEDED",
      isRevision: true,
      solvedAt: null,
      createdAt: pastDay(8),
      updatedAt: pastDay(2),
    },

    // Trees & BST
    {
      id: "dsa_prob_10",
      userId,
      title: "Maximum Depth of Binary Tree",
      category: "Trees & BST",
      difficulty: "EASY",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
      timeComplexity: "O(N)",
      spaceComplexity: "O(H)",
      companyTags: ["Google", "Apple", "Uber"],
      notes: "Recursive DFS: 1 + max(maxDepth(left), maxDepth(right)).",
      solutionCode: null,
      status: "SOLVED",
      isRevision: false,
      solvedAt: pastDay(4),
      createdAt: pastDay(9),
      updatedAt: pastDay(4),
    },
    {
      id: "dsa_prob_11",
      userId,
      title: "Invert Binary Tree",
      category: "Trees & BST",
      difficulty: "EASY",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/invert-binary-tree/",
      timeComplexity: "O(N)",
      spaceComplexity: "O(H)",
      companyTags: ["Google", "Meta", "Amazon"],
      notes: "Recursively swap left and right subtrees.",
      solutionCode: null,
      status: "SOLVED",
      isRevision: false,
      solvedAt: pastDay(3),
      createdAt: pastDay(8),
      updatedAt: pastDay(3),
    },
    {
      id: "dsa_prob_12",
      userId,
      title: "Validate Binary Search Tree",
      category: "Trees & BST",
      difficulty: "MEDIUM",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/validate-binary-search-tree/",
      timeComplexity: "O(N)",
      spaceComplexity: "O(H)",
      companyTags: ["Amazon", "Microsoft", "Bloomberg"],
      notes: "Pass (minVal, maxVal) boundaries recursively, or do an inorder traversal and check strictly increasing.",
      solutionCode: null,
      status: "SOLVED",
      isRevision: true,
      solvedAt: pastDay(2),
      createdAt: pastDay(7),
      updatedAt: pastDay(2),
    },
    {
      id: "dsa_prob_13",
      userId,
      title: "Lowest Common Ancestor of a Binary Tree",
      category: "Trees & BST",
      difficulty: "MEDIUM",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
      timeComplexity: "O(N)",
      spaceComplexity: "O(H)",
      companyTags: ["Meta", "Amazon", "Microsoft"],
      notes: "If root is p or q, return root. If both left and right return non-null, root is the LCA.",
      solutionCode: null,
      status: "UNSOLVED",
      isRevision: false,
      solvedAt: null,
      createdAt: pastDay(6),
      updatedAt: pastDay(6),
    },

    // Graphs (BFS/DFS)
    {
      id: "dsa_prob_14",
      userId,
      title: "Number of Islands",
      category: "Graphs (BFS/DFS)",
      difficulty: "MEDIUM",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/number-of-islands/",
      timeComplexity: "O(M * N)",
      spaceComplexity: "O(M * N)",
      companyTags: ["Amazon", "Google", "Microsoft", "Meta"],
      notes: "Iterate grid; when cell == '1', increment island count and flood-fill (DFS/BFS) to '0'.",
      solutionCode: null,
      status: "SOLVED",
      isRevision: false,
      solvedAt: pastDay(3),
      createdAt: pastDay(7),
      updatedAt: pastDay(3),
    },
    {
      id: "dsa_prob_15",
      userId,
      title: "Course Schedule (Topological Sort / Cycle Detection)",
      category: "Graphs (BFS/DFS)",
      difficulty: "MEDIUM",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/course-schedule/",
      timeComplexity: "O(V + E)",
      spaceComplexity: "O(V + E)",
      companyTags: ["Google", "Meta", "Amazon"],
      notes: "Kahn's Algorithm using in-degree array and queue. If processed count == numCourses, valid DAG.",
      solutionCode: null,
      status: "SOLVED",
      isRevision: true,
      solvedAt: pastDay(1),
      createdAt: pastDay(6),
      updatedAt: pastDay(1),
    },
    {
      id: "dsa_prob_16",
      userId,
      title: "Rotting Oranges",
      category: "Graphs (BFS/DFS)",
      difficulty: "MEDIUM",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/rotting-oranges/",
      timeComplexity: "O(M * N)",
      spaceComplexity: "O(M * N)",
      companyTags: ["Amazon", "Microsoft", "Uber"],
      notes: "Multi-source BFS starting with all initial rotten oranges in queue, advancing level by level (minutes).",
      solutionCode: null,
      status: "UNSOLVED",
      isRevision: false,
      solvedAt: null,
      createdAt: pastDay(5),
      updatedAt: pastDay(5),
    },
    {
      id: "dsa_prob_17",
      userId,
      title: "Word Ladder",
      category: "Graphs (BFS/DFS)",
      difficulty: "HARD",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/word-ladder/",
      timeComplexity: "O(M^2 * N)",
      spaceComplexity: "O(M * N)",
      companyTags: ["Amazon", "Google", "Meta"],
      notes: "Shortest transformation path via bidirectional BFS on word dictionary graph.",
      solutionCode: null,
      status: "UNSOLVED",
      isRevision: false,
      solvedAt: null,
      createdAt: pastDay(5),
      updatedAt: pastDay(5),
    },

    // Dynamic Programming
    {
      id: "dsa_prob_18",
      userId,
      title: "Climbing Stairs",
      category: "Dynamic Programming",
      difficulty: "EASY",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/climbing-stairs/",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
      companyTags: ["Adobe", "Uber", "Apple"],
      notes: "Fibonacci recurrence: dp[i] = dp[i-1] + dp[i-2]. Optimized to two variables.",
      solutionCode: null,
      status: "SOLVED",
      isRevision: false,
      solvedAt: pastDay(5),
      createdAt: pastDay(8),
      updatedAt: pastDay(5),
    },
    {
      id: "dsa_prob_19",
      userId,
      title: "Coin Change (Fewest Coins)",
      category: "Dynamic Programming",
      difficulty: "MEDIUM",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/coin-change/",
      timeComplexity: "O(amount * coins)",
      spaceComplexity: "O(amount)",
      companyTags: ["Amazon", "Microsoft", "Goldman Sachs"],
      notes: "Unbounded knapsack style: dp[i] = min(dp[i], 1 + dp[i - coin]) initialized with amount + 1.",
      solutionCode: null,
      status: "SOLVED",
      isRevision: true,
      solvedAt: pastDay(2),
      createdAt: pastDay(7),
      updatedAt: pastDay(2),
    },
    {
      id: "dsa_prob_20",
      userId,
      title: "Longest Increasing Subsequence (LIS)",
      category: "Dynamic Programming",
      difficulty: "MEDIUM",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/longest-increasing-subsequence/",
      timeComplexity: "O(N log N)",
      spaceComplexity: "O(N)",
      companyTags: ["Google", "Microsoft", "Amazon"],
      notes: "Patience sorting / binary search: maintain tails array and binary search (std::lower_bound) insertion index.",
      solutionCode: null,
      status: "REVISION_NEEDED",
      isRevision: true,
      solvedAt: null,
      createdAt: pastDay(6),
      updatedAt: pastDay(1),
    },
    {
      id: "dsa_prob_21",
      userId,
      title: "Trapping Rain Water",
      category: "Dynamic Programming",
      difficulty: "HARD",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/trapping-rain-water/",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
      companyTags: ["Google", "Amazon", "Goldman Sachs", "Apple"],
      notes: "Two pointer approach with leftMax and rightMax, advancing the smaller boundary.",
      solutionCode: null,
      status: "SOLVED",
      isRevision: true,
      solvedAt: pastDay(1),
      createdAt: pastDay(4),
      updatedAt: pastDay(1),
    },

    // Binary Search
    {
      id: "dsa_prob_22",
      userId,
      title: "Binary Search",
      category: "Binary Search",
      difficulty: "EASY",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/binary-search/",
      timeComplexity: "O(log N)",
      spaceComplexity: "O(1)",
      companyTags: ["Microsoft", "Apple", "Adobe"],
      notes: "mid = left + (right - left) / 2 to prevent integer overflow.",
      solutionCode: null,
      status: "SOLVED",
      isRevision: false,
      solvedAt: pastDay(7),
      createdAt: pastDay(12),
      updatedAt: pastDay(7),
    },
    {
      id: "dsa_prob_23",
      userId,
      title: "Search in Rotated Sorted Array",
      category: "Binary Search",
      difficulty: "MEDIUM",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
      timeComplexity: "O(log N)",
      spaceComplexity: "O(1)",
      companyTags: ["Google", "Amazon", "Meta", "Microsoft"],
      notes: "One half is always sorted! Check whether nums[left] <= nums[mid], then see if target lies in sorted half.",
      solutionCode: null,
      status: "SOLVED",
      isRevision: false,
      solvedAt: pastDay(3),
      createdAt: pastDay(6),
      updatedAt: pastDay(3),
    },

    // Stacks & Queues
    {
      id: "dsa_prob_24",
      userId,
      title: "Valid Parentheses",
      category: "Stacks & Queues",
      difficulty: "EASY",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/valid-parentheses/",
      timeComplexity: "O(N)",
      spaceComplexity: "O(N)",
      companyTags: ["Google", "Meta", "Amazon", "Bloomberg"],
      notes: "Push opening brackets into stack; on closing bracket, check stack.top() matches pair.",
      solutionCode: null,
      status: "SOLVED",
      isRevision: false,
      solvedAt: pastDay(6),
      createdAt: pastDay(10),
      updatedAt: pastDay(6),
    },

    // Recursion & Backtracking
    {
      id: "dsa_prob_25",
      userId,
      title: "Subsets (Power Set)",
      category: "Recursion & Backtracking",
      difficulty: "MEDIUM",
      platform: "LEETCODE",
      problemUrl: "https://leetcode.com/problems/subsets/",
      timeComplexity: "O(2^N)",
      spaceComplexity: "O(N)",
      companyTags: ["Meta", "Amazon", "Google"],
      notes: "Backtracking template: push to current list, recurse for index + 1, pop from list.",
      solutionCode: null,
      status: "UNSOLVED",
      isRevision: false,
      solvedAt: null,
      createdAt: pastDay(3),
      updatedAt: pastDay(3),
    },
  ];
}

function getUserProblemsList(userId: string): DSAProblemItem[] {
  let list = mockDSAStore.get(userId);
  if (!list) {
    list = getInitialDemoProblems(userId);
    mockDSAStore.set(userId, list);
  }
  return list;
}

export class DSAService {
  /**
   * Fetch all DSA problems for a student with flexible filters
   */
  static async getProblems(
    userId: string,
    filters?: DSAFilterInput
  ): Promise<DSAProblemItem[]> {
    let list = [...getUserProblemsList(userId)];

    // Filter by query (title, notes, or company)
    if (filters?.query && filters.query.trim()) {
      const q = filters.query.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.notes && p.notes.toLowerCase().includes(q)) ||
          p.companyTags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Filter by category
    if (filters?.category && filters.category !== "ALL") {
      list = list.filter((p) => p.category === filters.category);
    }

    // Filter by difficulty
    if (filters?.difficulty && filters.difficulty !== "ALL") {
      list = list.filter((p) => p.difficulty === filters.difficulty);
    }

    // Filter by status
    if (filters?.status && filters.status !== "ALL") {
      if (filters.status === "REVISION_NEEDED") {
        list = list.filter((p) => p.isRevision || p.status === "REVISION_NEEDED");
      } else {
        list = list.filter((p) => p.status === filters.status);
      }
    }

    // Filter by company tag
    if (filters?.company && filters.company !== "ALL") {
      list = list.filter((p) =>
        p.companyTags.some(
          (t) => t.toLowerCase() === filters.company!.toLowerCase()
        )
      );
    }

    // Sort
    const sortBy = filters?.sortBy || "default";
    list.sort((a, b) => {
      if (sortBy === "difficulty_asc") {
        const order = { EASY: 1, MEDIUM: 2, HARD: 3 };
        return order[a.difficulty] - order[b.difficulty];
      }
      if (sortBy === "difficulty_desc") {
        const order = { EASY: 1, MEDIUM: 2, HARD: 3 };
        return order[b.difficulty] - order[a.difficulty];
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "recent") {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      // default: status (unsolved first or revision, then solved)
      return 0;
    });

    return list;
  }

  /**
   * Get single problem by ID
   */
  static async getProblemById(id: string, userId: string): Promise<DSAProblemItem | null> {
    const all = await this.getProblems(userId);
    return all.find((p) => p.id === id) || null;
  }

  /**
   * Add a new custom problem
   */
  static async createProblem(
    userId: string,
    input: CreateDSAProblemInput
  ): Promise<DSAProblemItem> {
    const list = getUserProblemsList(userId);
    const newProblem: DSAProblemItem = {
      id: `dsa_prob_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      title: input.title,
      category: input.category,
      difficulty: input.difficulty,
      platform: input.platform || "LEETCODE",
      problemUrl: input.problemUrl || null,
      timeComplexity: input.timeComplexity || null,
      spaceComplexity: input.spaceComplexity || null,
      companyTags: input.companyTags || [],
      notes: input.notes || null,
      solutionCode: input.solutionCode || null,
      status: input.status || "UNSOLVED",
      isRevision: input.status === "REVISION_NEEDED",
      solvedAt: input.status === "SOLVED" ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    list.unshift(newProblem);
    mockDSAStore.set(userId, list);
    return newProblem;
  }

  /**
   * Update problem details
   */
  static async updateProblem(
    id: string,
    userId: string,
    input: UpdateDSAProblemInput
  ): Promise<DSAProblemItem> {
    const list = getUserProblemsList(userId);
    const index = list.findIndex((p) => p.id === id && p.userId === userId);
    if (index === -1) throw new Error("Problem not found or unauthorized");

    const existing = list[index];
    const isNowSolved = input.status === "SOLVED";
    const solvedAt = isNowSolved
      ? existing.solvedAt || new Date()
      : input.status !== undefined
      ? null
      : existing.solvedAt;

    const merged: DSAProblemItem = {
      ...existing,
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.difficulty !== undefined ? { difficulty: input.difficulty } : {}),
      ...(input.platform !== undefined ? { platform: input.platform } : {}),
      ...(input.problemUrl !== undefined ? { problemUrl: input.problemUrl } : {}),
      ...(input.timeComplexity !== undefined ? { timeComplexity: input.timeComplexity } : {}),
      ...(input.spaceComplexity !== undefined ? { spaceComplexity: input.spaceComplexity } : {}),
      ...(input.companyTags !== undefined ? { companyTags: input.companyTags } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.solutionCode !== undefined ? { solutionCode: input.solutionCode } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      solvedAt,
      updatedAt: new Date(),
    };

    list[index] = merged;
    mockDSAStore.set(userId, list);
    return merged;
  }

  /**
   * Toggle problem solve status (UNSOLVED <-> SOLVED)
   */
  static async toggleSolveStatus(
    id: string,
    userId: string,
    desiredStatus?: DSAStatus
  ): Promise<DSAProblemItem> {
    const list = getUserProblemsList(userId);
    const problem = list.find((p) => p.id === id && p.userId === userId);
    if (!problem) throw new Error("Problem not found");

    const newStatus: DSAStatus =
      desiredStatus !== undefined
        ? desiredStatus
        : problem.status === "SOLVED"
        ? "UNSOLVED"
        : "SOLVED";

    return this.updateProblem(id, userId, { status: newStatus });
  }

  /**
   * Toggle revision bookmark flag
   */
  static async toggleRevisionFlag(id: string, userId: string): Promise<DSAProblemItem> {
    const list = getUserProblemsList(userId);
    const index = list.findIndex((p) => p.id === id && p.userId === userId);
    if (index === -1) throw new Error("Problem not found");

    const existing = list[index];
    const newIsRevision = !existing.isRevision;
    const newStatus =
      newIsRevision && existing.status !== "SOLVED"
        ? ("REVISION_NEEDED" as DSAStatus)
        : existing.status === "REVISION_NEEDED" && !newIsRevision
        ? ("UNSOLVED" as DSAStatus)
        : existing.status;

    existing.isRevision = newIsRevision;
    existing.status = newStatus;
    existing.updatedAt = new Date();
    list[index] = existing;
    mockDSAStore.set(userId, list);
    return existing;
  }

  /**
   * Delete custom problem
   */
  static async deleteProblem(id: string, userId: string): Promise<boolean> {
    const list = getUserProblemsList(userId);
    const index = list.findIndex((p) => p.id === id && p.userId === userId);
    if (index !== -1) {
      list.splice(index, 1);
      mockDSAStore.set(userId, list);
      return true;
    }
    return false;
  }

  /**
   * Calculate live analytics, completion percentages & difficulty breakdowns
   */
  static async getDSAStats(userId: string): Promise<DSAStats> {
    const problems = await this.getProblems(userId);
    const total = problems.length;
    const solved = problems.filter((p) => p.status === "SOLVED").length;
    const revisionCount = problems.filter((p) => p.isRevision || p.status === "REVISION_NEEDED").length;

    // Difficulty Breakdown
    const easyProblems = problems.filter((p) => p.difficulty === "EASY");
    const easySolved = easyProblems.filter((p) => p.status === "SOLVED").length;

    const medProblems = problems.filter((p) => p.difficulty === "MEDIUM");
    const medSolved = medProblems.filter((p) => p.status === "SOLVED").length;

    const hardProblems = problems.filter((p) => p.difficulty === "HARD");
    const hardSolved = hardProblems.filter((p) => p.status === "SOLVED").length;

    // Category Breakdown
    const categories = DSA_CATEGORIES.map((cat) => {
      const catProblems = problems.filter((p) => p.category === cat);
      const catSolved = catProblems.filter((p) => p.status === "SOLVED").length;
      const catTotal = catProblems.length;
      return {
        name: cat,
        solved: catSolved,
        total: catTotal,
        pct: catTotal > 0 ? Math.round((catSolved / catTotal) * 100) : 0,
      };
    });

    return {
      totalSolved: solved,
      totalProblems: total,
      completionRate: total > 0 ? Math.round((solved / total) * 100) : 0,
      streakDays: 14,
      revisionCount,
      difficultyStats: {
        easy: {
          solved: easySolved,
          total: easyProblems.length,
          pct: easyProblems.length > 0 ? Math.round((easySolved / easyProblems.length) * 100) : 0,
        },
        medium: {
          solved: medSolved,
          total: medProblems.length,
          pct: medProblems.length > 0 ? Math.round((medSolved / medProblems.length) * 100) : 0,
        },
        hard: {
          solved: hardSolved,
          total: hardProblems.length,
          pct: hardProblems.length > 0 ? Math.round((hardSolved / hardProblems.length) * 100) : 0,
        },
      },
      categories,
    };
  }
}
