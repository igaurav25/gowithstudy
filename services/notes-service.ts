import { prisma } from "@/lib/prisma";
import { isDbConnected } from "@/lib/db-check";
import {
  CreateNoteInput,
  UpdateNoteInput,
  NotesFilterInput,
  NoteStatus,
} from "@/schemas/notes";

export interface VivaQuestionItem {
  question: string;
  answer: string;
  tip?: string;
}

export interface NoteItem {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  subject: string;
  category: string;
  tags: string[];
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  status: NoteStatus;
  isArchived: boolean;
  fullNotesText?: string;
  syllabusTopics?: string[];
  vivaQuestions?: VivaQuestionItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NotesStats {
  total: number;
  inProgress: number;
  completed: number;
  read: number;
  archived: number;
  subjectCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
}

// In-memory fallback notes cache for student accounts
const mockNotesStore = new Map<string, NoteItem[]>();

function getInitialDemoNotes(userId: string): NoteItem[] {
  const now = new Date();
  return [
    {
      id: "note_os_01",
      userId,
      title: "Operating Systems — Process Scheduling, Synchronization & Deadlocks",
      description:
        "Comprehensive lecture breakdown of Banker's Algorithm, Peterson's Solution, Mutex semaphores, and Round-Robin vs Multi-Level Feedback Queue scheduling with numerical examples.",
      subject: "Operating Systems",
      category: "Lecture Notes",
      tags: ["OS", "CPU-Scheduling", "Deadlocks", "Bankers-Algorithm", "Semaphores"],
      fileUrl: "/sample-notes/os-scheduling.pdf",
      fileName: "CS301_OS_Process_Scheduling.pdf",
      fileSize: 4200000,
      status: "IN_PROGRESS",
      isArchived: false,
      syllabusTopics: [
        "Unit 1: Process Control Block (PCB) & CPU Scheduling (FCFS, SJF, RR, Priority, MLFQ)",
        "Unit 2: Critical Section Problem, Peterson's Solution, Counting & Binary Semaphores",
        "Unit 3: Deadlock 4 Conditions, Resource Allocation Graphs, Banker's Safety Algorithm",
      ],
      fullNotesText: `# CS301: Operating Systems — Master Lecture Notes

## Module 1: CPU Scheduling Algorithms & Gantt Chart Analysis
CPU scheduling determines which process in the ready queue is allocated the CPU core.

### 1. Key Performance Criteria:
* **Turnaround Time (TAT)** = Completion Time (CT) - Arrival Time (AT)
* **Waiting Time (WT)** = Turnaround Time (TAT) - Burst Time (BT)
* **Response Time (RT)** = Time from process arrival to first CPU allocation.
* **Throughput** = Number of processes completed per unit time.

### 2. Classical Scheduling Paradigms:
1. **First-Come, First-Served (FCFS)**: Non-preemptive. Suffers from the **Convoy Effect** where short processes wait behind CPU-intensive jobs.
2. **Shortest Job First (SJF / SRTF)**: Provably optimal for minimizing average waiting time. Preemptive version is Shortest Remaining Time First (SRTF).
3. **Round Robin (RR)**: Designed for time-sharing systems. Uses a fixed **Time Quantum (q)**. If q is very large, RR degenerates to FCFS; if q is too small, context switching overhead dominates CPU cycles.
4. **Multi-Level Feedback Queue (MLFQ)**: Adaptive scheduling where I/O-bound jobs gain high priority and CPU-bound jobs gradually sink to lower priority queues.

---

## Module 2: Process Synchronization & Concurrency
When concurrent processes share memory or resources, uncontrolled access causes race conditions.

### The Critical Section Problem:
Any valid solution MUST satisfy three strict conditions:
1. **Mutual Exclusion**: If Process $P_i$ is executing in its critical section, no other process may execute in its critical section.
2. **Progress**: If no process is in its critical section and some wish to enter, selection cannot be postponed indefinitely.
3. **Bounded Waiting**: There must be a bound on the number of times other processes are allowed to enter their critical sections after a process has made a request.

### Semaphores:
A semaphore \`S\` is an integer variable accessed only through atomic operations \`wait()\` (or \`P()\`) and \`signal()\` (or \`V()\`).
\`\`\`c
void wait(Semaphore S) {
    while (S <= 0); // busy wait in spinlock
    S--;
}

void signal(Semaphore S) {
    S++;
}
\`\`\`

---

## Module 3: Deadlock Avoidance & Banker's Algorithm
A deadlock occurs when a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by another process.

### The 4 Coffman Conditions (Must hold simultaneously):
1. **Mutual Exclusion**: At least one resource must be held in a non-shareable mode.
2. **Hold and Wait**: A process holds at least one resource and is waiting for others.
3. **No Preemption**: Resources cannot be preempted; released only voluntarily.
4. **Circular Wait**: A closed chain of processes exists where each process holds resources needed by the next.

### Banker's Algorithm Solved Example:
* Let **Processes** = {P0, P1, P2, P3, P4} and **Resources** = {A, B, C}.
* **Available** = [3, 3, 2]
* **Need Matrix Calculation**: $\\text{Need}[i][j] = \\text{Max}[i][j] - \\text{Allocation}[i][j]$.
* Testing safety:
  - P1 can be allocated since Need [1, 2, 2] $\\le$ Available [3, 3, 2].
  - New Available after P1 releases = [3, 3, 2] + [2, 0, 0] = [5, 3, 2].
  - P3 can proceed next $\\rightarrow$ New Available = [5, 3, 2] + [2, 1, 1] = [7, 4, 3].
  - P4, P0, P2 follow in sequence.
* **Safe Sequence**: $\\langle P1, P3, P4, P0, P2 \\rangle$. System is in a SAFE state!`,
      vivaQuestions: [
        {
          question: "What is the Convoy Effect in CPU scheduling?",
          answer:
            "The convoy effect occurs in FCFS scheduling when a CPU-bound process with a huge burst time holds the processor, causing all smaller I/O-bound processes to wait in the ready queue, resulting in poor CPU and device utilization.",
          tip: "Always contrast this with how Round Robin or SRTF mitigates the problem.",
        },
        {
          question: "Why is Peterson's solution limited to only two processes?",
          answer:
            "Peterson's algorithm relies on two shared variables: an array 'flag[2]' and integer 'turn'. Extending it to N processes requires Lamport's Bakery Algorithm or hardware atomic primitives like Test-and-Set.",
        },
        {
          question: "What is the difference between Deadlock Prevention and Deadlock Avoidance?",
          answer:
            "Deadlock prevention eliminates deadlocks by ensuring that at least one of the 4 Coffman conditions can never hold. Deadlock avoidance dynamically examines resource allocation state (e.g., Banker's Algorithm) to ensure the system never enters an unsafe state.",
        },
      ],
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "note_dbms_02",
      userId,
      title: "Database Management Systems — Normalization & B+ Trees Cheatsheet",
      description:
        "Quick reference cheat sheet covering 1NF to BCNF decomposition, Lossless Join testing, Dependency Preservation, and B+ Tree node splitting/merging algorithms.",
      subject: "Database Management Systems",
      category: "Cheatsheet",
      tags: ["DBMS", "Normalization", "BCNF", "B-Tree", "SQL-Optimization"],
      fileUrl: "/sample-notes/dbms-bcnf.pdf",
      fileName: "CS302_DBMS_Normalization_CheatSheet.pdf",
      fileSize: 2800000,
      status: "COMPLETED",
      isArchived: false,
      syllabusTopics: [
        "Unit 2: Relational Algebra & Advanced SQL Query Optimization",
        "Unit 3: Functional Dependencies, 1NF, 2NF, 3NF, BCNF & Lossless Decomposition",
        "Unit 4: ACID Properties, Two-Phase Locking (2PL), B+ Tree Indexing",
      ],
      fullNotesText: `# CS302: Database Management Systems — Master Revision Notes

## Module 1: Relational Normalization (1NF to BCNF)
Normalization decomposes tables to eliminate redundancy and update/deletion anomalies.

### Normal Forms Hierarchy:
\`\`\`
   +-----------------------------+
   |   BCNF (Boyce-Codd)         |  Strict: For every X -> Y, X must be a Super Key
   |  +-----------------------+  |
   |  |   3NF (Third NF)      |  |  X is Super Key OR Y is Prime Attribute
   |  |  +-----------------+  |  |
   |  |  |   2NF (Second)  |  |  |  No Partial Dependency on candidate key
   |  |  |  +-----------+  |  |  |
   |  |  |  |   1NF     |  |  |  |  Atomic (single-valued) attribute values
   +-----------------------------+
\`\`\`

### Step-by-Step Normalization Rules:
1. **First Normal Form (1NF)**: All attributes contain only atomic values. No multivalued attributes (e.g. storing multiple phone numbers in one string column violates 1NF).
2. **Second Normal Form (2NF)**: Must be in 1NF, and **NO non-prime attribute is partially dependent on any candidate key**. If candidate key is composite $(A, B)$, then $A \\rightarrow C$ is a partial dependency violation.
3. **Third Normal Form (3NF)**: Must be in 2NF, and for every non-trivial functional dependency $X \\rightarrow Y$:
   - Either $X$ is a **Super Key**, OR
   - $Y$ is a **Prime Attribute** (part of a candidate key).
4. **Boyce-Codd Normal Form (BCNF)**: Strictly requires that for every non-trivial $X \\rightarrow Y$, **$X$ MUST be a Super Key**. BCNF eliminates all redundancy based on functional dependencies, but may not preserve dependencies.

---

## Module 2: Transaction Processing & ACID Guarantees
A transaction is a logical unit of database processing that includes one or more database access operations.

* **A — Atomicity**: Either all operations of the transaction are reflected in the database or none are. (Managed by Recovery Manager using Write-Ahead Logging / WAL).
* **C — Consistency**: Execution of a transaction in isolation preserves the consistency of the database constraints.
* **I — Isolation**: Concurrent transactions execute as if they are running serially without interference. (Managed by Concurrency Control using 2-Phase Locking / 2PL).
* **D — Durability**: Changes made by a committed transaction persist even in the event of system crash or power outage.

---

## Module 3: B+ Tree Index Structures
A B+ Tree is an N-ary self-balancing search tree used in storage engines (PostgreSQL, MySQL InnoDB):
* **Internal Nodes**: Store search keys and child pointers only (no data records).
* **Leaf Nodes**: Store all actual data pointers/records, and all leaves are doubly linked in a sorted linked list for rapid range scans.
* **Height**: $O(\\log_B N)$, where $B$ is the block branching factor (typically 100 to 500), keeping disk I/O to $\\le 3$ seeks for millions of records.`,
      vivaQuestions: [
        {
          question: "Can a table in 3NF violate BCNF?",
          answer:
            "Yes. If a relation has overlapping composite candidate keys and a dependency exists where a prime attribute depends on a non-super key, the table is in 3NF but violates BCNF.",
          tip: "Give the classic example: R(Student, Subject, Teacher) with FDs: { (Student, Subject) -> Teacher, Teacher -> Subject }.",
        },
        {
          question: "What is the difference between Strict 2PL and Rigorous 2PL?",
          answer:
            "In Strict 2PL, all exclusive (write) locks are held until the transaction commits or aborts. In Rigorous 2PL, ALL locks (both shared and exclusive) are held until transaction completion.",
        },
      ],
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: "note_cn_03",
      userId,
      title: "Computer Networks — TCP/IP Protocol Suite & Subnetting Guide",
      description:
        "Exam preparation handbook on IPv4 CIDR subnetting calculations, TCP 3-way handshake, congestion control (Slow Start, AIMD), and DNS resolution flow.",
      subject: "Computer Networks",
      category: "Exam Prep",
      tags: ["Networks", "Subnetting", "TCP", "CIDR", "DNS", "OSI-Model"],
      fileUrl: "/sample-notes/cn-subnetting.pdf",
      fileName: "CS303_Networks_Subnetting_Guide.pdf",
      fileSize: 5100000,
      status: "READ",
      isArchived: false,
      syllabusTopics: [
        "Unit 1: OSI 7-Layer Architecture vs TCP/IP Protocol Stack",
        "Unit 3: IPv4 CIDR Subnetting Calculations & Routing Algorithms (Dijkstra's)",
        "Unit 4: TCP 3-Way Handshake, Flow Control & AIMD Congestion Control",
      ],
      fullNotesText: `# CS303: Computer Networks — Exam Preparation Notes

## Module 1: OSI 7-Layer Model vs TCP/IP
\`\`\`
OSI Layer           TCP/IP Protocol Suite       Data Unit      Primary Function
7. Application   \  HTTP, DNS, SMTP, FTP        Message        User interface & network services
6. Presentation   > Application Layer           Message        Data encoding, encryption, compression
5. Session       /  Sockets, TLS Sessions       Message        Dialog control & synchronization
4. Transport        TCP, UDP                    Segment        Process-to-process delivery & flow control
3. Network          IPv4, IPv6, ICMP, ARP       Packet         Host-to-host packet routing (IP addressing)
2. Data Link        Ethernet, Wi-Fi (802.11)    Frame          Hop-to-hop framing & MAC addressing
1. Physical         Cat6, Fiber, Radio signals  Bits           Bit-stream transmission over physical media
\`\`\`

---

## Module 2: IPv4 CIDR Subnetting Formula & Masterclass
Classless Inter-Domain Routing (CIDR) uses notation \`IP/n\`, where \`n\` is the prefix length (number of network bits).

### Key Subnetting Formulas:
1. **Total Number of Addresses** = $2^{(32 - n)}$
2. **Number of Usable Host IP Addresses** = $2^{(32 - n)} - 2$ *(Subtract 2 for Network ID and Broadcast Address)*
3. **Subnet Mask Calculation**:
   - \`/24\` = \`255.255.255.0\` (256 addresses, 254 hosts)
   - \`/26\` = \`255.255.255.192\` (64 addresses, 62 hosts)
   - \`/28\` = \`255.255.255.240\` (16 addresses, 14 hosts)

### Solved Example: Subnetting \`192.168.10.0/26\`
* Borrowed bits = $26 - 24 = 2$ bits.
* Number of subnets created = $2^2 = 4$ subnets.
* Block size per subnet = $256 - 192 = 64$.
  - **Subnet 1**: Network ID = \`192.168.10.0\`, Usable Hosts = \`192.168.10.1\` to \`192.168.10.62\`, Broadcast = \`192.168.10.63\`.
  - **Subnet 2**: Network ID = \`192.168.10.64\`, Usable Hosts = \`192.168.10.65\` to \`192.168.10.126\`, Broadcast = \`192.168.10.127\`.

---

## Module 3: TCP Connection Management & Congestion Control
### TCP 3-Way Handshake (Connection Establishment):
1. **Client $\\rightarrow$ Server**: \`SYN = 1, Seq = X\`
2. **Server $\\rightarrow$ Client**: \`SYN = 1, ACK = 1, Seq = Y, Ack = X + 1\`
3. **Client $\\rightarrow$ Server**: \`ACK = 1, Seq = X + 1, Ack = Y + 1\`

### TCP Congestion Control Mechanism:
* **Slow Start**: Congestion Window (cwnd) starts at 1 MSS and doubles every RTT ($2, 4, 8, 16\\dots$) exponentially until reaching \`ssthresh\` (Slow Start Threshold).
* **Congestion Avoidance (AIMD)**: Above \`ssthresh\`, cwnd increases linearly (+1 MSS per RTT) to probe bandwidth conservatively.
* **On Packet Loss (Triple Duplicate ACK)**: Fast Retransmit triggers immediately without waiting for retransmission timer timeout; cwnd drops to \`ssthresh / 2\` (Fast Recovery).`,
      vivaQuestions: [
        {
          question: "Why does UDP have less overhead than TCP?",
          answer:
            "UDP has a fixed 8-byte header compared to TCP's 20-60 byte header, and UDP maintains no connection state, no sequence numbers, no acknowledgments, and no retransmissions, making it ideal for low-latency voice and gaming.",
        },
        {
          question: "What is the difference between ARP and RARP?",
          answer:
            "ARP (Address Resolution Protocol) resolves a known logical IP address to a physical MAC address on a local link. RARP (Reverse ARP) does the reverse: discovers the host IP address given a physical hardware MAC address.",
        },
      ],
      createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: "note_dsa_04",
      userId,
      title: "Design & Analysis of Algorithms — Dynamic Programming Patterns",
      description:
        "Patterns & templates for 0/1 Knapsack, Longest Common Subsequence (LCS), Matrix Chain Multiplication, and Bitmask DP with time & space complexity proofs.",
      subject: "Data Structures & Algorithms",
      category: "Lecture Notes",
      tags: ["DSA", "DP", "Knapsack", "LCS", "Algorithms", "Memoization"],
      fileUrl: "/sample-notes/dsa-dp-patterns.pdf",
      fileName: "CS201_DSA_DP_Master_Patterns.pdf",
      fileSize: 3700000,
      status: "IN_PROGRESS",
      isArchived: false,
      syllabusTopics: [
        "Unit 1: Asymptotic Notations & Master Theorem for Divide-and-Conquer",
        "Unit 3: Dynamic Programming Recurrences (0/1 Knapsack, LCS, Matrix Chain)",
        "Unit 5: P, NP, NP-Hard, and NP-Complete Reductions",
      ],
      fullNotesText: `# CS304: Design & Analysis of Algorithms — Dynamic Programming Master Patterns

## Module 1: The Dynamic Programming Paradigm
Dynamic Programming solves problems by combining solutions to overlapping subproblems that possess an **Optimal Substructure**.

### Top-Down (Memoization) vs Bottom-Up (Tabulation):
* **Memoization**: Recursive approach with a cache (HashMap or 2D array). Solves only subproblems that are strictly necessary.
* **Tabulation**: Iterative approach that fills a DP table sequentially from base cases. Zero recursion call-stack overhead and easier space-optimization.

---

## Module 2: The 0/1 Knapsack Pattern
Given weights \`wt[]\` and values \`val[]\` of $N$ items, maximize total value inside a knapsack of capacity $W$.

### State Definition & Recurrence:
Let \`dp[i][w]\` be the maximum value obtained using a subset of items from index $0$ to $i-1$ with remaining capacity $w$.
$$dp[i][w] = \\max\\big(dp[i-1][w], \\; val[i-1] + dp[i-1][w - wt[i-1]]\\big)$$

### Optimized C++ Implementation (O(W) Space):
\`\`\`cpp
int knapsack(int W, const vector<int>& wt, const vector<int>& val, int n) {
    vector<int> dp(W + 1, 0);
    for (int i = 0; i < n; i++) {
        // Iterate backwards to prevent using the same item multiple times
        for (int w = W; w >= wt[i]; w--) {
            dp[w] = max(dp[w], val[i] + dp[w - wt[i]]);
        }
    }
    return dp[W];
}
\`\`\`
* **Time Complexity**: $O(N \\times W)$ (Pseudo-polynomial).
* **Space Complexity**: $O(W)$ (Optimized 1D array).

---

## Module 3: Longest Common Subsequence (LCS)
Find the length of the longest subsequence present in both string $S_1$ of length $m$ and $S_2$ of length $n$.

### Recurrence Relation:
* If $S_1[i-1] == S_2[j-1]$: $dp[i][j] = 1 + dp[i-1][j-1]$
* Else: $dp[i][j] = \\max(dp[i-1][j], dp[i][j-1])$
\`\`\`java
public int longestCommonSubsequence(String text1, String text2) {
    int m = text1.length(), n = text2.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                dp[i][j] = 1 + dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
}
\`\`\``,
      vivaQuestions: [
        {
          question: "Why is 0/1 Knapsack considered pseudo-polynomial time?",
          answer:
            "The time complexity is O(N * W), where W is the numerical value of capacity. In complexity theory, input size is measured by the number of bits log2(W). Since W is exponential in the number of bits, O(N * W) is exponential in the input size.",
        },
        {
          question: "When should we choose Greedy over Dynamic Programming?",
          answer:
            "Greedy is appropriate when the problem exhibits the Greedy Choice Property (a globally optimal solution can be reached by making a locally optimal choice at each step, e.g., Fractional Knapsack). If local choices do not guarantee global optimality, DP is required (e.g., 0/1 Knapsack).",
        },
      ],
      createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      id: "note_oop_05",
      userId,
      title: "Object-Oriented Programming — SOLID Principles & Design Patterns",
      description:
        "Lab manual & implementation guide for Singleton, Factory, Observer, and Strategy design patterns in Java with UML class diagrams and code snippets.",
      subject: "Object-Oriented Programming",
      category: "Lab Manual",
      tags: ["Java", "OOP", "SOLID", "Design-Patterns", "UML"],
      fileUrl: "/sample-notes/oop-solid.pdf",
      fileName: "CS202_OOP_SOLID_Design_Patterns.pdf",
      fileSize: 3100000,
      status: "COMPLETED",
      isArchived: false,
      syllabusTopics: [
        "Unit 1: 4 Pillars of OOP (Encapsulation, Abstraction, Inheritance, Polymorphism)",
        "Unit 2: SOLID Object-Oriented Design Principles",
        "Unit 4: Gang of Four (GoF) Creational & Behavioral Patterns",
      ],
      fullNotesText: `# CS202: Object-Oriented Software Design & SOLID Masterclass

## Module 1: The 5 SOLID Principles
Developed by Robert C. Martin, SOLID principles eliminate code fragility and tight coupling.

### 1. S — Single Responsibility Principle (SRP)
* A class should have one, and only one, reason to change.
* *Example*: Separate the \`Student\` entity from \`StudentDatabaseRepository\` and \`StudentReportPrinter\`.

### 2. O — Open/Closed Principle (OCP)
* Software artifacts should be **Open for extension, but Closed for modification**.
* Achieve this via abstract classes and interfaces rather than modifying existing switch statements.

### 3. L — Liskov Substitution Principle (LSP)
* Subtypes must be substitutable for their base types without altering program correctness.
* *Classic Violation*: Making \`Square\` inherit from \`Rectangle\` where setting width also changes height, violating rectangle invariants.

### 4. I — Interface Segregation Principle (ISP)
* Clients should not be forced to depend on interfaces they do not use.
* Break bloated interfaces into small, cohesive, role-based interfaces.

### 5. D — Dependency Inversion Principle (DIP)
* High-level modules should not depend on low-level modules; both should depend on abstractions.
* Core engine of Dependency Injection (DI) frameworks (Spring Boot, NestJS).

---

## Module 2: Key Gang of Four (GoF) Design Patterns

### 1. Thread-Safe Singleton Pattern (Double-Checked Locking):
\`\`\`java
public class DatabasePool {
    private static volatile DatabasePool instance;
    private DatabasePool() { /* private constructor prevents direct instantiation */ }

    public static DatabasePool getInstance() {
        if (instance == null) {
            synchronized (DatabasePool.class) {
                if (instance == null) {
                    instance = new DatabasePool();
                }
            }
        }
        return instance;
    }
}
\`\`\`

### 2. Strategy Pattern (Runtime Behavioral Swapping):
Defines a family of algorithms, encapsulates each one, and makes them interchangeable.
\`\`\`typescript
interface PaymentStrategy {
    pay(amount: number): boolean;
}

class UPIPayment implements PaymentStrategy {
    pay(amount: number) { console.log(\`Paid \${amount} via UPI\`); return true; }
}

class CardPayment implements PaymentStrategy {
    pay(amount: number) { console.log(\`Paid \${amount} via Card\`); return true; }
}
\`\`\``,
      vivaQuestions: [
        {
          question: "What is the role of the 'volatile' keyword in Double-Checked Locking Singleton?",
          answer:
            "The volatile keyword ensures that multiple threads handle the singleton instance correctly by preventing compiler instruction reordering during object instantiation in memory.",
        },
      ],
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: "note_ml_06",
      userId,
      title: "Machine Learning — Gradient Descent, Backpropagation & Loss Surfaces",
      description:
        "Detailed mathematical derivation of stochastic gradient descent with momentum, Adam optimizer, cross-entropy loss, and backpropagation chain rule.",
      subject: "Machine Learning",
      category: "Lecture Notes",
      tags: ["ML", "GradientDescent", "Backprop", "NeuralNetworks", "Math"],
      fileUrl: "/sample-notes/ml-optimization.pdf",
      fileName: "CS401_ML_Gradient_Descent_Math.pdf",
      fileSize: 6400000,
      status: "IN_PROGRESS",
      isArchived: false,
      syllabusTopics: [
        "Unit 1: Supervised Learning, Cost Functions & Gradient Descent",
        "Unit 2: Multilayer Perceptrons & Backpropagation Multivariate Calculus",
        "Unit 3: Modern Optimizers: Momentum, RMSProp, Adam",
      ],
      fullNotesText: `# CS401: Machine Learning & Optimization Master Notes

## Module 1: Gradient Descent & Loss Optimization
Gradient Descent iteratively computes parameters $\\theta$ to minimize a continuous differentiable loss function $J(\\theta)$.

### Parameter Update Rule:
$$\\theta := \\theta - \\alpha \\nabla_\\theta J(\\theta)$$
Where:
* $\\alpha$ is the learning rate (step size).
* $\\nabla_\\theta J(\\theta)$ is the gradient vector of partial derivatives pointing in the direction of steepest ascent.

---

## Module 2: The Backpropagation Algorithm (Chain Rule)
In a feedforward neural network with weights $W^{(l)}$ and biases $b^{(l)}$:
1. **Forward Propagation**: Compute activations $a^{(l)} = \\sigma(z^{(l)})$ where $z^{(l)} = W^{(l)} a^{(l-1)} + b^{(l)}$.
2. **Output Error Vector $\\delta^{(L)}$**:
   $$\\delta^{(L)} = \\nabla_a J \\odot \\sigma'(z^{(L)})$$
3. **Error Backpropagation**:
   $$\\delta^{(l)} = \\big((W^{(l+1)})^T \\delta^{(l+1)}\\big) \\odot \\sigma'(z^{(l)})$$
4. **Gradient Updates**:
   $$\\frac{\\partial J}{\\partial W^{(l)}} = \\delta^{(l)} (a^{(l-1)})^T, \\quad \\frac{\\partial J}{\\partial b^{(l)}} = \\delta^{(l)}$$`,
      vivaQuestions: [
        {
          question: "Why do we use Mini-Batch Gradient Descent instead of Pure Batch or Pure Stochastic?",
          answer:
            "Mini-Batch GD combines the stability of Batch GD with the computational efficiency and vectorized GPU acceleration of Stochastic GD, striking the optimal balance between convergence speed and memory usage.",
        },
      ],
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    },
  ];
}

function getUserNotesList(userId: string): NoteItem[] {
  if (!mockNotesStore.has(userId)) {
    mockNotesStore.set(userId, getInitialDemoNotes(userId));
  }
  return mockNotesStore.get(userId)!;
}

export class NotesService {
  /**
   * Fetch all notes for a specific user with multi-criteria filtering and sorting
   */
  static async getNotes(
    userId: string,
    filters?: NotesFilterInput
  ): Promise<NoteItem[]> {
    try {
      if (await isDbConnected()) {
        const dbNotes = await prisma.note.findMany({
        where: {
          userId,
          isArchived: filters?.isArchived ?? false,
          ...(filters?.subject && filters.subject !== "ALL"
            ? { subject: filters.subject }
            : {}),
          ...(filters?.category && filters.category !== "ALL"
            ? { category: filters.category }
            : {}),
          ...(filters?.status && filters.status !== "ALL"
            ? { status: filters.status }
            : {}),
          ...(filters?.query
            ? {
                OR: [
                  { title: { contains: filters.query, mode: "insensitive" } },
                  { description: { contains: filters.query, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        orderBy:
          filters?.sortBy === "oldest"
            ? { createdAt: "asc" }
            : filters?.sortBy === "title"
            ? { title: "asc" }
            : { createdAt: "desc" },
      });

      if (dbNotes && dbNotes.length > 0) {
        return dbNotes.map((n) => ({
          ...n,
          status: n.status as NoteStatus,
          fileName: n.fileUrl ? n.fileUrl.split("/").pop() || null : null,
        }));
      }
    }
  } catch {
    // Fallback to in-memory store if DB is disconnected
  }

    // Filter in-memory store
    let notes = [...getUserNotesList(userId)];

    // Archive filter
    const isArchivedFilter = filters?.isArchived ?? false;
    notes = notes.filter((n) => n.isArchived === isArchivedFilter);

    // Subject filter
    if (filters?.subject && filters.subject !== "ALL") {
      notes = notes.filter(
        (n) => n.subject.toLowerCase() === filters.subject!.toLowerCase()
      );
    }

    // Category filter
    if (filters?.category && filters.category !== "ALL") {
      notes = notes.filter(
        (n) => n.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    // Status filter
    if (filters?.status && filters.status !== "ALL") {
      notes = notes.filter((n) => n.status === filters.status);
    }

    // Search query
    if (filters?.query && filters.query.trim()) {
      const q = filters.query.toLowerCase().trim();
      notes = notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          (n.description && n.description.toLowerCase().includes(q)) ||
          n.tags.some((t) => t.toLowerCase().includes(q)) ||
          n.subject.toLowerCase().includes(q)
      );
    }

    // Sorting
    const sortBy = filters?.sortBy || "newest";
    notes.sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "size") {
        return (b.fileSize || 0) - (a.fileSize || 0);
      }
      // default: newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return notes;
  }

  /**
   * Get single note by ID with strict ownership validation
   */
  static async getNoteById(id: string, userId: string): Promise<NoteItem | null> {
    try {
      if (await isDbConnected()) {
        const note = await prisma.note.findFirst({
        where: { id, userId },
      });
      if (note) {
        return {
          ...note,
          status: note.status as NoteStatus,
          fileName: note.fileUrl ? note.fileUrl.split("/").pop() || null : null,
        };
      }
    }
  } catch {
    // Fallback
  }

    const list = getUserNotesList(userId);
    const found = list.find((n) => n.id === id && n.userId === userId);
    return found || null;
  }

  /**
   * Create a new note
   */
  static async createNote(
    userId: string,
    input: CreateNoteInput
  ): Promise<NoteItem> {
    const newNote: NoteItem = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      title: input.title,
      description: input.description || null,
      subject: input.subject,
      category: input.category || "Lecture Notes",
      tags: input.tags || [],
      fileUrl: input.fileUrl || null,
      fileName: input.fileName || (input.fileUrl ? input.fileUrl.split("/").pop() || null : null),
      fileSize: input.fileSize || null,
      status: input.status || "IN_PROGRESS",
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const created = await prisma.note.create({
        data: {
          id: newNote.id,
          userId,
          title: newNote.title,
          description: newNote.description,
          subject: newNote.subject,
          category: newNote.category,
          tags: newNote.tags,
          fileUrl: newNote.fileUrl,
          fileSize: newNote.fileSize,
          status: newNote.status,
          isArchived: false,
        },
      });

      return {
        ...created,
        status: created.status as NoteStatus,
        fileName: newNote.fileName,
      };
    } catch {
      // In-memory fallback
      const list = getUserNotesList(userId);
      list.unshift(newNote);
      mockNotesStore.set(userId, list);
      return newNote;
    }
  }

  /**
   * Update an existing note with ownership validation
   */
  static async updateNote(
    id: string,
    userId: string,
    input: UpdateNoteInput
  ): Promise<NoteItem> {
    try {
      const updated = await prisma.note.update({
        where: { id },
        data: {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.subject !== undefined ? { subject: input.subject } : {}),
          ...(input.category !== undefined ? { category: input.category } : {}),
          ...(input.tags !== undefined ? { tags: input.tags } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
          ...(input.fileUrl !== undefined ? { fileUrl: input.fileUrl } : {}),
          ...(input.fileSize !== undefined ? { fileSize: input.fileSize } : {}),
          updatedAt: new Date(),
        },
      });

      return {
        ...updated,
        status: updated.status as NoteStatus,
        fileName: updated.fileUrl ? updated.fileUrl.split("/").pop() || null : null,
      };
    } catch {
      // In-memory update
      const list = getUserNotesList(userId);
      const index = list.findIndex((n) => n.id === id && n.userId === userId);
      if (index === -1) {
        throw new Error("Note not found or unauthorized");
      }

      const existing = list[index];
      const merged: NoteItem = {
        ...existing,
        ...input,
        updatedAt: new Date(),
      };
      list[index] = merged;
      mockNotesStore.set(userId, list);
      return merged;
    }
  }

  /**
   * Update note reading status
   */
  static async updateNoteStatus(
    id: string,
    userId: string,
    status: NoteStatus
  ): Promise<NoteItem> {
    return this.updateNote(id, userId, { status });
  }

  /**
   * Toggle archive state
   */
  static async toggleArchiveNote(id: string, userId: string): Promise<NoteItem> {
    const note = await this.getNoteById(id, userId);
    if (!note) {
      throw new Error("Note not found or unauthorized");
    }

    try {
      const updated = await prisma.note.update({
        where: { id },
        data: {
          isArchived: !note.isArchived,
          updatedAt: new Date(),
        },
      });
      return {
        ...updated,
        status: updated.status as NoteStatus,
        fileName: updated.fileUrl ? updated.fileUrl.split("/").pop() || null : null,
      };
    } catch {
      const list = getUserNotesList(userId);
      const index = list.findIndex((n) => n.id === id);
      if (index !== -1) {
        list[index].isArchived = !list[index].isArchived;
        list[index].updatedAt = new Date();
        return list[index];
      }
      throw new Error("Note not found or unauthorized");
    }
  }

  /**
   * Delete note
   */
  static async deleteNote(id: string, userId: string): Promise<boolean> {
    try {
      await prisma.note.delete({
        where: { id },
      });
      return true;
    } catch {
      const list = getUserNotesList(userId);
      const index = list.findIndex((n) => n.id === id && n.userId === userId);
      if (index !== -1) {
        list.splice(index, 1);
        mockNotesStore.set(userId, list);
        return true;
      }
      return false;
    }
  }

  /**
   * Calculate summary metrics across all notes for this student
   */
  static async getNotesStats(userId: string): Promise<NotesStats> {
    const allNotes = await this.getNotes(userId, { isArchived: false });
    const archivedNotes = await this.getNotes(userId, { isArchived: true });

    const subjectCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    let inProgress = 0;
    let completed = 0;
    let read = 0;

    for (const note of allNotes) {
      // Subject distribution
      subjectCounts[note.subject] = (subjectCounts[note.subject] || 0) + 1;
      // Category distribution
      categoryCounts[note.category] = (categoryCounts[note.category] || 0) + 1;

      if (note.status === "IN_PROGRESS") inProgress++;
      else if (note.status === "COMPLETED") completed++;
      else if (note.status === "READ") read++;
    }

    return {
      total: allNotes.length,
      inProgress,
      completed,
      read,
      archived: archivedNotes.length,
      subjectCounts,
      categoryCounts,
    };
  }
}
