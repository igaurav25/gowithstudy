import { DocumentChunk } from "@/lib/rag/types";

/**
 * Splits plain text into overlapping chunks with estimated page counts.
 */
export function chunkDocumentText(
  noteId: string,
  noteTitle: string,
  subject: string,
  rawText: string,
  wordsPerChunk = 300,
  overlapWords = 50
): DocumentChunk[] {
  const words = rawText.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const chunks: DocumentChunk[] = [];
  const wordsPerPage = 250; // typical academic page word count
  let chunkIndex = 0;
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + wordsPerChunk, words.length);
    const chunkWords = words.slice(start, end);
    const content = chunkWords.join(" ");

    const pageNumber = Math.max(1, Math.floor(start / wordsPerPage) + 1);

    // Extract notable keywords
    const keywords = Array.from(
      new Set(
        chunkWords
          .filter((w) => w.length > 4 && /^[a-zA-Z0-9_-]+$/.test(w))
          .map((w) => w.toLowerCase())
      )
    ).slice(0, 10);

    chunks.push({
      id: `${noteId}_chunk_${chunkIndex++}`,
      noteId,
      noteTitle,
      subject,
      pageNumber,
      content,
      keywords,
    });

    if (end === words.length) break;
    start += wordsPerChunk - overlapWords;
  }

  return chunks;
}

/**
 * High-quality, curated semantic knowledge base for the core CSE notes.
 * Pre-chunked with academic accuracy, exact page boundaries, and technical rigor.
 */
export const CORE_CSE_SEMANTIC_CHUNKS: DocumentChunk[] = [
  // --- Operating Systems ---
  {
    id: "os_chunk_01",
    noteId: "note_os_01",
    noteTitle: "Operating Systems — Process Scheduling & Deadlock Prevention",
    subject: "Operating Systems",
    pageNumber: 4,
    content: `CPU Scheduling Algorithms:
Shortest Job First (SJF) is provably optimal in minimizing average waiting time for a given set of processes. However, SJF cannot be implemented in long-term schedulers because the length of the next CPU burst cannot be known in advance; it must be predicted using exponential smoothing: tau_{n+1} = alpha * t_n + (1 - alpha) * tau_n.
Round Robin (RR) scheduling allocates a fixed time quantum (q). If the time quantum is extremely large, RR degenerates into First-Come First-Served (FCFS). If q is extremely small, RR creates excessive context-switch overhead. The rule of thumb is that 80% of CPU bursts should be shorter than the time quantum.`,
    keywords: ["scheduling", "sjf", "round-robin", "quantum", "fcfs", "burst", "context-switch"],
  },
  {
    id: "os_chunk_02",
    noteId: "note_os_01",
    noteTitle: "Operating Systems — Process Scheduling & Deadlock Prevention",
    subject: "Operating Systems",
    pageNumber: 8,
    content: `Process Synchronization & The Critical Section Problem:
Any valid solution to the critical section problem must satisfy three mandatory criteria:
1. Mutual Exclusion: If process P_i is executing in its critical section, no other processes can execute in their critical sections.
2. Progress: If no process is executing in its critical section and some processes wish to enter, only those processes not in their remainder sections can participate in deciding who enters next, and selection cannot be postponed indefinitely.
3. Bounded Waiting: A bound must exist on the number of times other processes are allowed to enter their critical sections after a process has made a request.
Peterson's algorithm is a software solution for two processes using two variables: boolean flag[2] and int turn. Semaphores are synchronization tools; a counting semaphore has an unrestricted integer range, whereas a binary semaphore (mutex) can only take values 0 and 1.`,
    keywords: ["synchronization", "critical-section", "mutual-exclusion", "progress", "bounded-waiting", "petersons", "semaphore", "mutex"],
  },
  {
    id: "os_chunk_03",
    noteId: "note_os_01",
    noteTitle: "Operating Systems — Process Scheduling & Deadlock Prevention",
    subject: "Operating Systems",
    pageNumber: 15,
    content: `Deadlock Characterization & Banker's Algorithm:
A deadlock state occurs if and only if four Coffman conditions hold simultaneously:
1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.
2. Hold and Wait: A process must hold at least one resource and be waiting to acquire additional resources held by others.
3. No Preemption: Resources cannot be forcibly preempted from a holding process.
4. Circular Wait: A closed chain of processes exists such that P0 waits for P1, P1 waits for P2, and Pn waits for P0.
Dijkstra's Banker's Algorithm avoids deadlocks by ensuring the system never enters an unsafe state. It maintains matrices: Allocation[n,m], Max[n,m], Available[m], and Need[n,m] where Need[i,j] = Max[i,j] - Allocation[i,j]. A state is considered SAFE if there exists at least one safe sequence <P1, P2, ..., Pn> of process completions without triggering starvation.`,
    keywords: ["deadlock", "coffman", "bankers", "allocation", "need", "available", "safe-state", "circular-wait", "preemption"],
  },

  // --- Database Management Systems ---
  {
    id: "dbms_chunk_01",
    noteId: "note_dbms_02",
    noteTitle: "Database Management Systems — Normalization & B+ Trees Cheatsheet",
    subject: "Database Management Systems",
    pageNumber: 3,
    content: `Relational Database Normalization:
1NF (First Normal Form): A relation is in 1NF if all domain values are atomic (no repeating groups, multi-valued attributes, or composite attributes).
2NF (Second Normal Form): A relation is in 2NF if it is in 1NF and every non-prime attribute is fully functionally dependent on every candidate key (no partial functional dependencies where a proper subset of a candidate key determines a non-prime attribute).
3NF (Third Normal Form): A relation is in 3NF if for every non-trivial functional dependency X -> Y, either X is a superkey, or Y is a prime attribute (part of some candidate key). 3NF eliminates transitive dependencies.
BCNF (Boyce-Codd Normal Form): A stricter version of 3NF where for every non-trivial functional dependency X -> Y, X MUST be a superkey. Every relation can be decomposed into 3NF preserving both lossless join and dependencies, but BCNF decomposition guarantees lossless join while dependency preservation may not always be achievable.`,
    keywords: ["normalization", "1nf", "2nf", "3nf", "bcnf", "functional-dependency", "superkey", "candidate-key", "transitive"],
  },
  {
    id: "dbms_chunk_02",
    noteId: "note_dbms_02",
    noteTitle: "Database Management Systems — Normalization & B+ Trees Cheatsheet",
    subject: "Database Management Systems",
    pageNumber: 9,
    content: `B+ Tree Indexing Architecture:
A B+ Tree is an N-ary balanced search tree optimized for systems with block-oriented storage (disks).
Key structural properties:
1. All actual record pointers and data values reside exclusively in the leaf nodes.
2. Internal nodes contain only routing search keys and child page pointers to direct traversals.
3. Leaf nodes are linked sequentially via a doubly-linked list, allowing O(log_B N) point lookups as well as highly efficient range scans (e.g. BETWEEN 10 AND 50).
4. For order p: every internal node (except root) has at least ceil(p/2) child pointers. When a node overflows upon insertion, it splits at the midpoint and the middle key is copied (leaf) or pushed up (internal).`,
    keywords: ["b-tree", "indexing", "b-plus-tree", "range-queries", "leaf-nodes", "pointers", "split", "search-tree"],
  },
  {
    id: "dbms_chunk_03",
    noteId: "note_dbms_02",
    noteTitle: "Database Management Systems — Normalization & B+ Trees Cheatsheet",
    subject: "Database Management Systems",
    pageNumber: 17,
    content: `Concurrency Control & Two-Phase Locking (2PL):
A schedule is Conflict Serializable if it is conflict equivalent to a serial schedule. This is tested using a Precedence Graph (Serialization Graph); if the graph contains no cycles, the schedule is conflict serializable.
Two-Phase Locking (2PL) guarantees conflict serializability:
1. Growing Phase: A transaction may acquire locks (Shared S or Exclusive X) but cannot release any lock.
2. Shrinking Phase: A transaction may release locks but cannot acquire new locks.
Strict 2PL requires that all Exclusive (write) locks held by a transaction must be held until the transaction commits or aborts. Rigorous 2PL requires both Shared and Exclusive locks to be held until commit/abort. Strict 2PL prevents cascading rollbacks (cascading aborts).`,
    keywords: ["concurrency", "transactions", "2pl", "two-phase-locking", "strict-2pl", "conflict-serializability", "locks", "cascading-abort"],
  },

  // --- Computer Networks ---
  {
    id: "cn_chunk_01",
    noteId: "note_cn_03",
    noteTitle: "Computer Networks — TCP/IP Protocol Suite & Subnetting Guide",
    subject: "Computer Networks",
    pageNumber: 5,
    content: `OSI 7-Layer Model vs TCP/IP Protocol Architecture:
The OSI Reference Model has 7 layers:
7. Application (HTTP, DNS, FTP)
6. Presentation (Encryption, Compression, MIME)
5. Session (RPC, NetBIOS, session checkpointing)
4. Transport (TCP, UDP - Port addressing, Segmentation)
3. Network (IP, ICMP, OSPF, BGP - Logical IP addressing, Routing)
2. Data Link (Ethernet, Wi-Fi, MAC addressing, Framing, Error detection via CRC)
1. Physical (Bits, cables, optical fiber, modulation).
The TCP/IP model condenses Session, Presentation, and Application into a single Application layer, and Physical/Data Link into Network Access layer. Protocol Data Units (PDUs): Application (Data/Message), Transport (Segment/Datagram), Network (Packet), Data Link (Frame), Physical (Bits).`,
    keywords: ["osi-model", "tcp-ip", "layers", "transport", "network", "datalink", "pdu", "segment", "packet", "frame"],
  },
  {
    id: "cn_chunk_02",
    noteId: "note_cn_03",
    noteTitle: "Computer Networks — TCP/IP Protocol Suite & Subnetting Guide",
    subject: "Computer Networks",
    pageNumber: 9,
    content: `CIDR Subnetting Calculations:
Classless Inter-Domain Routing (CIDR) uses slash notation /n to specify the number of bits in the network prefix.
Given an IP block 192.168.10.0/26:
- Prefix bits = 26, Host bits = 32 - 26 = 6 bits.
- Subnet mask = 255.255.255.192.
- Total IP addresses per subnet = 2^6 = 64.
- Usable host IP addresses = 2^6 - 2 = 62 (first IP is Network ID, last IP is Direct Broadcast Address).
- Subnets created from a /24 class C: 2^(26-24) = 4 subnets:
  Subnet 0: 192.168.10.0 to 192.168.10.63 (Usable: .1 to .62)
  Subnet 1: 192.168.10.64 to 192.168.10.127 (Usable: .65 to .126)
  Subnet 2: 192.168.10.128 to 192.168.10.191 (Usable: .129 to .190)
  Subnet 3: 192.168.10.192 to 192.168.10.255 (Usable: .193 to .254)`,
    keywords: ["subnetting", "cidr", "ip-address", "mask", "broadcast", "network-id", "usable-hosts", "ipv4"],
  },
  {
    id: "cn_chunk_03",
    noteId: "note_cn_03",
    noteTitle: "Computer Networks — TCP/IP Protocol Suite & Subnetting Guide",
    subject: "Computer Networks",
    pageNumber: 16,
    content: `TCP Congestion Control & 3-Way Handshake:
TCP Connection Establishment (3-Way Handshake):
1. Client sends SYN (seq = x)
2. Server responds with SYN-ACK (seq = y, ack = x + 1)
3. Client sends ACK (seq = x + 1, ack = y + 1).
TCP Congestion Control phases:
1. Slow Start: Congestion Window (cwnd) begins at 1 MSS and doubles every RTT (exponential growth: 1, 2, 4, 8, ...) until reaching ssthresh (Slow Start Threshold).
2. Congestion Avoidance: Once cwnd >= ssthresh, cwnd increases linearly by 1 MSS per RTT (Additive Increase).
3. Packet Loss via 3 Duplicate ACKs: Fast Retransmit immediately resends missing segment without waiting for timeout; Fast Recovery sets ssthresh = cwnd / 2 and cwnd = ssthresh + 3 MSS.
4. Loss via Timeout: Drastic reset: ssthresh = cwnd / 2 and cwnd drops back to 1 MSS (Multiplicative Decrease).`,
    keywords: ["tcp", "handshake", "congestion-control", "slow-start", "aimd", "cwnd", "ssthresh", "fast-retransmit", "rtt"],
  },

  // --- Data Structures & Algorithms ---
  {
    id: "dsa_chunk_01",
    noteId: "note_dsa_04",
    noteTitle: "Design & Analysis of Algorithms — Dynamic Programming Patterns",
    subject: "Data Structures & Algorithms",
    pageNumber: 5,
    content: `Dynamic Programming Fundamentals:
Dynamic Programming (DP) is an optimization technique applied to problems exhibiting two core properties:
1. Optimal Substructure: An optimal solution to the problem contains optimal solutions to subproblems.
2. Overlapping Subproblems: The recursive algorithm visits the same subproblems repeatedly rather than generating new subproblems (as in Divide and Conquer).
Approaches:
- Top-Down with Memoization: Recursive structure with an auxiliary table (hash map or array) caching subproblem results.
- Bottom-Up with Tabulation: Iterative state calculation starting from base cases up to the desired target state. Eliminates recursion call stack overhead.`,
    keywords: ["dp", "dynamic-programming", "memoization", "tabulation", "optimal-substructure", "overlapping-subproblems"],
  },
  {
    id: "dsa_chunk_02",
    noteId: "note_dsa_04",
    noteTitle: "Design & Analysis of Algorithms — Dynamic Programming Patterns",
    subject: "Data Structures & Algorithms",
    pageNumber: 10,
    content: `0/1 Knapsack Problem Master Template:
Problem: Given N items with weights wt[] and values val[], and a knapsack of capacity W, maximize total value without exceeding capacity. Each item can be picked at most once (0 or 1).
Recurrence Relation:
dp[i][w] = max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]]) if wt[i-1] <= w
dp[i][w] = dp[i-1][w] otherwise.
Base Cases: dp[0][w] = 0 for all w; dp[i][0] = 0 for all i.
Complexity: Time Complexity O(N * W), Space Complexity O(N * W).
Space Optimization: Since dp[i][w] depends only on the previous row dp[i-1], we can optimize space to O(W) using a 1D array traversed backwards from W down to wt[i-1] to prevent using the same item twice.`,
    keywords: ["knapsack", "0-1-knapsack", "recurrence", "time-complexity", "space-optimization", "subset-sum"],
  },
  {
    id: "dsa_chunk_03",
    noteId: "note_dsa_04",
    noteTitle: "Design & Analysis of Algorithms — Dynamic Programming Patterns",
    subject: "Data Structures & Algorithms",
    pageNumber: 16,
    content: `Longest Common Subsequence (LCS):
Given two strings text1 of length m and text2 of length n:
Recurrence:
If text1[i-1] == text2[j-1]:
    dp[i][j] = 1 + dp[i-1][j-1]
Else:
    dp[i][j] = max(dp[i-1][j], dp[i][j-1])
Base Case: dp[i][0] = 0 and dp[0][j] = 0.
Time Complexity: O(m * n). Space Complexity: O(m * n), optimizable to O(min(m, n)).
Variations derived from LCS:
1. Longest Common Substring: reset dp[i][j] = 0 on mismatch, track max val.
2. Shortest Common Supersequence: Length = m + n - LCS(text1, text2).
3. Minimum Insertions/Deletions to transform String A to String B.`,
    keywords: ["lcs", "longest-common-subsequence", "string-dp", "edit-distance", "supersequence"],
  },

  // --- Object-Oriented Programming ---
  {
    id: "oop_chunk_01",
    noteId: "note_oop_05",
    noteTitle: "Object-Oriented Programming — SOLID Principles & Design Patterns",
    subject: "Object-Oriented Programming",
    pageNumber: 4,
    content: `SOLID Principles of Object-Oriented Software Design:
S - Single Responsibility Principle (SRP): A class should have one, and only one, reason to change. Each class should encapsulate a single functionality.
O - Open/Closed Principle (OCP): Software entities (classes, modules, functions) should be open for extension, but closed for modification (achieved via interfaces and abstract classes).
L - Liskov Substitution Principle (LSP): Subtypes must be substitutable for their base types without altering the correctness of the program (e.g., Rectangle vs Square classic violation).
I - Interface Segregation Principle (ISP): Clients should not be forced to depend upon interfaces that they do not use (prefer many small, specific interfaces over one bloated interface).
D - Dependency Inversion Principle (DIP): High-level modules should not depend on low-level modules; both should depend on abstractions. Abstractions should not depend on details.`,
    keywords: ["solid", "srp", "ocp", "lsp", "isp", "dip", "oop", "design-principles", "abstraction"],
  },
  {
    id: "oop_chunk_02",
    noteId: "note_oop_05",
    noteTitle: "Object-Oriented Programming — SOLID Principles & Design Patterns",
    subject: "Object-Oriented Programming",
    pageNumber: 11,
    content: `Creational & Structural Patterns:
Singleton Pattern (Thread-safe Double-Checked Locking in Java):
private static volatile DatabaseConnection instance;
public static DatabaseConnection getInstance() {
    if (instance == null) {
        synchronized (DatabaseConnection.class) {
            if (instance == null) instance = new DatabaseConnection();
        }
    }
    return instance;
}
Factory Method: Defines an interface for creating an object, but lets subclasses decide which class to instantiate.
Observer Pattern: Defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically (Subject/Observer interface).`,
    keywords: ["singleton", "factory-pattern", "observer-pattern", "double-checked-locking", "design-patterns", "java"],
  },

  // --- Machine Learning ---
  {
    id: "ml_chunk_01",
    noteId: "note_ml_06",
    noteTitle: "Machine Learning — Gradient Descent, Backpropagation & Loss Surfaces",
    subject: "Machine Learning",
    pageNumber: 5,
    content: `Gradient Descent Optimization Variants:
The parameter update rule for minimizing loss function J(theta): theta = theta - eta * grad J(theta), where eta is the learning rate.
1. Batch Gradient Descent: Computes the gradient over the entire training dataset. Stable convergence, but computationally prohibitive for large datasets (O(N) per step).
2. Stochastic Gradient Descent (SGD): Updates parameters for every single training example. Extremely fast, but exhibits high variance fluctuations and noisy zig-zag trajectories.
3. Mini-Batch Gradient Descent: Best compromise; computes gradient over batches of size B (typically 32, 64, 128, 256). Takes advantage of GPU hardware vectorization.
Adam (Adaptive Moment Estimation): Combines Momentum (first moment m_t = beta1 * m_{t-1} + (1-beta1) * g_t) and RMSprop (second raw moment v_t = beta2 * v_{t-1} + (1-beta2) * g_t^2) with bias correction.`,
    keywords: ["gradient-descent", "sgd", "mini-batch", "adam", "momentum", "optimizer", "loss", "learning-rate"],
  },
];
