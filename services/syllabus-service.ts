// ==============================================================================
// CampusFlow — B.Tech Computer Science & Engineering Syllabus Service
// Complete, accredited semester-wise academic curriculum and course outlines
// ==============================================================================

export interface SyllabusUnit {
  unitNumber: number;
  title: string;
  hours: number;
  topics: string[];
}

export interface CourseSyllabus {
  id: string;
  courseCode: string;
  title: string;
  semester: number;
  credits: number;
  totalHours: number;
  category: "Core Computer Science" | "Core Engineering" | "Professional Elective" | "Mathematics & Science";
  description: string;
  prerequisites: string[];
  units: SyllabusUnit[];
  textbooks: { title: string; author: string; edition: string }[];
  labExperiments?: string[];
  examWeightage: {
    midTermPercent: number;
    endTermPercent: number;
    internalAssignmentsPercent: number;
  };
}

export const BTECH_CSE_SYLLABUS: CourseSyllabus[] = [
  {
    id: "cs301-os",
    courseCode: "CS301",
    title: "Operating Systems",
    semester: 5,
    credits: 4,
    totalHours: 45,
    category: "Core Computer Science",
    description:
      "Fundamental concepts of operating systems, process management, CPU scheduling, inter-process communication, memory management, virtual memory, deadlocks, and file systems.",
    prerequisites: ["Data Structures & Algorithms", "Computer Organization"],
    examWeightage: {
      midTermPercent: 30,
      endTermPercent: 50,
      internalAssignmentsPercent: 20,
    },
    units: [
      {
        unitNumber: 1,
        title: "Introduction & Process Management",
        hours: 9,
        topics: [
          "Operating System structures, System calls, Dual-mode operation (User vs Kernel)",
          "Process concept, Process Control Block (PCB), Process States & Transitions",
          "Context switching, CPU scheduling criteria, Preemptive vs Non-preemptive",
          "Scheduling algorithms: FCFS, SJF, SRTF, Priority, Round Robin, Multi-level Feedback Queue (MLFQ)",
          "Inter-Process Communication (IPC): Shared memory vs Message passing",
        ],
      },
      {
        unitNumber: 2,
        title: "Process Synchronization & Concurrency",
        hours: 9,
        topics: [
          "Critical Section Problem and requirements (Mutual Exclusion, Progress, Bounded Waiting)",
          "Peterson's Algorithm for two-process synchronization",
          "Hardware support for synchronization (TestAndSet, Swap, Atomic instructions)",
          "Semaphores: Counting & Binary semaphores, Wait() and Signal() operations",
          "Classical synchronization problems: Bounded Buffer (Producer-Consumer), Dining Philosophers, Readers-Writers",
          "Monitors and Condition Variables",
        ],
      },
      {
        unitNumber: 3,
        title: "Deadlocks Detection & Prevention",
        hours: 8,
        topics: [
          "Four necessary conditions for Deadlock (Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait)",
          "Resource Allocation Graphs (RAG) and cycle detection",
          "Deadlock Prevention strategies and Deadlock Avoidance",
          "Banker's Algorithm: Safety algorithm and Resource-Request algorithm with numerical proofs",
          "Deadlock Detection and Recovery techniques (Process termination, Resource preemption)",
        ],
      },
      {
        unitNumber: 4,
        title: "Memory Management & Virtual Memory",
        hours: 10,
        topics: [
          "Logical vs Physical Address Space, Memory protection with Base & Limit registers",
          "Contiguous Allocation, Dynamic storage allocation (First-Fit, Best-Fit, Worst-Fit), Fragmentation",
          "Paging: Page tables, Hardware implementation, Translation Lookaside Buffer (TLB), Effective Access Time (EAT)",
          "Multi-level paging, Inverted page tables, Segmentation with paging",
          "Virtual Memory: Demand Paging, Page Fault handling routine",
          "Page Replacement Algorithms: FIFO, Optimal (Belady's Anomaly), LRU, Clock algorithm",
          "Thrashing, Working-Set Model, and Page-Fault Frequency",
        ],
      },
      {
        unitNumber: 5,
        title: "Storage & File Systems",
        hours: 9,
        topics: [
          "File concept, Access methods (Sequential, Direct), Directory structures (Single-level, Two-level, Tree, Acyclic-graph)",
          "File system mounting, Protection and Access Control Lists (ACLs)",
          "File System Implementation: Allocation methods (Contiguous, Linked, Indexed / Inode-based)",
          "Free space management: Bit vector, Linked list, Grouping, Counting",
          "Disk scheduling algorithms: FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK",
        ],
      },
    ],
    textbooks: [
      {
        title: "Operating System Concepts",
        author: "Abraham Silberschatz, Peter B. Galvin, Greg Gagne",
        edition: "10th Edition (Wiley)",
      },
      {
        title: "Modern Operating Systems",
        author: "Andrew S. Tanenbaum, Herbert Bos",
        edition: "4th Edition (Pearson)",
      },
    ],
    labExperiments: [
      "Simulation of CPU Scheduling Algorithms (FCFS, SJF, Priority, Round Robin in C/C++)",
      "Process creation and IPC using fork(), pipe(), and POSIX shared memory",
      "Implementation of Producer-Consumer problem using Semaphores & Pthreads mutex",
      "Implementation of Banker's Algorithm for Deadlock Avoidance",
      "Simulation of Page Replacement Algorithms (FIFO, LRU, Optimal)",
      "Simulation of Disk Scheduling Algorithms (SCAN, C-SCAN, SSTF)",
    ],
  },
  {
    id: "cs302-dbms",
    courseCode: "CS302",
    title: "Database Management Systems",
    semester: 5,
    credits: 4,
    totalHours: 45,
    category: "Core Computer Science",
    description:
      "Data models, Relational algebra, SQL, Normalization theory, Transaction processing, Concurrency control, Recovery management, and B+ Tree indexing.",
    prerequisites: ["Data Structures & Algorithms"],
    examWeightage: {
      midTermPercent: 30,
      endTermPercent: 50,
      internalAssignmentsPercent: 20,
    },
    units: [
      {
        unitNumber: 1,
        title: "Database Architecture & ER Modeling",
        hours: 8,
        topics: [
          "Database System Concepts, 3-Schema Architecture, Data Independence (Physical & Logical)",
          "Entity-Relationship (ER) model: Entities, Attributes, Relationships, Cardinality ratios",
          "Extended ER (EER) features: Specialization, Generalization, Aggregation, Category",
          "Mapping ER/EER diagrams to Relational Schemas with integrity constraints",
        ],
      },
      {
        unitNumber: 2,
        title: "Relational Query Languages (Relational Algebra & SQL)",
        hours: 10,
        topics: [
          "Relational Algebra: Select, Project, Union, Set Difference, Cartesian Product, Join (Theta, Equi, Natural, Outer)",
          "SQL DDL: CREATE, ALTER, DROP, TRUNCATE, Constraints (PRIMARY KEY, FOREIGN KEY, CHECK, UNIQUE)",
          "SQL DML: SELECT, INSERT, UPDATE, DELETE, Complex nested queries, Correlated subqueries",
          "Aggregate functions, GROUP BY, HAVING, Set operations (UNION, INTERSECT, EXCEPT)",
          "SQL Views, Triggers, Stored Procedures, and Transactions (COMMIT, ROLLBACK, SAVEPOINT)",
        ],
      },
      {
        unitNumber: 3,
        title: "Relational Database Design & Normalization",
        hours: 10,
        topics: [
          "Pitfalls in relational design, Anomalies (Insertion, Deletion, Update)",
          "Functional Dependencies (FD), Armstrong's Axioms, Attribute Closure algorithm, Canonical Cover",
          "Normal Forms: First Normal Form (1NF), Second Normal Form (2NF), Third Normal Form (3NF)",
          "Boyce-Codd Normal Form (BCNF) and comparison with 3NF",
          "Lossless-Join Decomposition testing and Dependency Preservation verification",
          "Multi-valued Dependencies (MVD) and Fourth Normal Form (4NF)",
        ],
      },
      {
        unitNumber: 4,
        title: "Transaction Processing & Concurrency Control",
        hours: 9,
        topics: [
          "Transaction concept, ACID Properties (Atomicity, Consistency, Isolation, Durability)",
          "Transaction states, Concurrent executions, Serializability (Conflict vs View serializability)",
          "Precedence Graphs and testing for Conflict Serializability",
          "Concurrency Control Protocols: Lock-Based (Shared/Exclusive locks, Two-Phase Locking / 2PL, Strict 2PL)",
          "Deadlock handling in DBMS: Wait-Die, Wound-Wait, Wait-for Graphs",
          "Timestamp-based protocols and Validation-based protocols",
        ],
      },
      {
        unitNumber: 5,
        title: "Storage Structures, Indexing & Recovery",
        hours: 8,
        topics: [
          "File organization: Heap, Sorted, Hashing",
          "Index classification: Primary, Secondary, Clustering, Dense vs Sparse indices",
          "B-Trees and B+ Trees: Structure, Search, Insertion, Deletion, and Node Splitting algorithms",
          "Database Recovery Systems: Failure classification, Log-Based recovery (WAL - Write-Ahead Logging)",
          "Deferred database modification vs Immediate database modification, Checkpointing",
        ],
      },
    ],
    textbooks: [
      {
        title: "Database System Concepts",
        author: "Abraham Silberschatz, Henry F. Korth, S. Sudarshan",
        edition: "7th Edition (McGraw-Hill)",
      },
      {
        title: "Fundamentals of Database Systems",
        author: "Ramez Elmasri, Shamkant B. Navathe",
        edition: "7th Edition (Pearson)",
      },
    ],
    labExperiments: [
      "DDL commands: Creating tables with PRIMARY, FOREIGN KEY and CHECK constraints",
      "DML queries: Nested subqueries, Correlated subqueries, and Joins in PostgreSQL/MySQL",
      "Aggregate queries with GROUP BY and HAVING clauses",
      "Designing ER diagram and normalized relational schema for a University Management System",
      "Implementation of PL/SQL Stored Procedures, Functions, and Triggers",
      "Simulating Concurrency anomalies and 2-Phase Locking isolation levels",
    ],
  },
  {
    id: "cs303-cn",
    courseCode: "CS303",
    title: "Computer Networks",
    semester: 5,
    credits: 4,
    totalHours: 45,
    category: "Core Computer Science",
    description:
      "Computer network architectures, ISO-OSI and TCP/IP protocol stacks, physical media, data link framing and error control, network layer routing, IP addressing, transport protocols, and application layer protocols.",
    prerequisites: ["Operating Systems", "Programming in C/C++"],
    examWeightage: {
      midTermPercent: 30,
      endTermPercent: 50,
      internalAssignmentsPercent: 20,
    },
    units: [
      {
        unitNumber: 1,
        title: "Introduction & Physical Layer",
        hours: 8,
        topics: [
          "Network topologies (Mesh, Star, Bus, Ring), Types of networks (LAN, MAN, WAN)",
          "Layered architecture: ISO-OSI 7-layer reference model vs TCP/IP 4-layer model",
          "Transmission media: Guided (Twisted pair, Coaxial, Fiber optic) and Unguided (Radio, Microwave)",
          "Data transmission impairments, Nyquist Bit Rate formula, Shannon Channel Capacity theorem",
          "Switching techniques: Circuit Switching vs Packet Switching (Datagram vs Virtual Circuit)",
        ],
      },
      {
        unitNumber: 2,
        title: "Data Link Layer & MAC Sublayer",
        hours: 10,
        topics: [
          "Data Link Layer design issues, Framing methods (Character count, Byte stuffing, Bit stuffing)",
          "Error detection and correction: Parity check, Checksum, Cyclic Redundancy Check (CRC), Hamming Codes",
          "Elementary Data Link protocols: Stop-and-Wait, Sliding Window protocols (Go-Back-N ARQ, Selective Repeat ARQ)",
          "Medium Access Control (MAC): Pure ALOHA, Slotted ALOHA, CSMA, CSMA/CD (Ethernet collision detection), CSMA/CA (Wi-Fi)",
          "Ethernet standards (IEEE 802.3), MAC addressing, Bridging, Switching, and VLANs",
        ],
      },
      {
        unitNumber: 3,
        title: "Network Layer & IPv4/IPv6 Addressing",
        hours: 10,
        topics: [
          "Network Layer design issues, Store-and-forward packet switching, Connectionless vs Connection-oriented service",
          "Routing algorithms: Shortest Path (Dijkstra's), Distance Vector Routing (Bellman-Ford, Count-to-Infinity problem), Link State Routing",
          "Hierarchical routing, Broadcast & Multicast routing",
          "IPv4 Addressing: Classful addressing, Classless Inter-Domain Routing (CIDR), Subnetting and Supernetting numericals",
          "IPv4 Header format, Fragmentation and Reassembly",
          "Auxiliary protocols: ARP (Address Resolution Protocol), RARP, ICMP, DHCP, NAT (Network Address Translation)",
          "IPv6 Address structure, Header format, and transition mechanisms (Dual stack, Tunneling)",
        ],
      },
      {
        unitNumber: 4,
        title: "Transport Layer Protocols",
        hours: 9,
        topics: [
          "Transport layer services, Port numbers, Sockets, Multiplexing and Demultiplexing",
          "User Datagram Protocol (UDP): Segment structure, Checksum calculation, Use cases",
          "Transmission Control Protocol (TCP): Segment header, Connection management (3-way handshake, 4-way termination)",
          "TCP Reliability: Sequence numbers, Cumulative ACKs, Retransmission timers (Jacobson's algorithm, Karn's algorithm)",
          "TCP Flow Control: Sliding window mechanism, Silly Window Syndrome",
          "TCP Congestion Control: AIMD (Additive Increase Multiplicative Decrease), Slow Start, Congestion Avoidance, Fast Retransmit, Fast Recovery",
        ],
      },
      {
        unitNumber: 5,
        title: "Application Layer & Network Security",
        hours: 8,
        topics: [
          "Domain Name System (DNS): Hierarchical namespace, Resource records, Iterative vs Recursive resolution",
          "Hypertext Transfer Protocol (HTTP/1.1, HTTP/2, HTTP/3 QUIC), Persistent vs Non-persistent connections, Cookies, REST APIs",
          "Email protocols: SMTP, POP3, IMAP, MIME format",
          "File Transfer Protocol (FTP), SSH, Telnet",
          "Network Security fundamentals: Symmetric vs Asymmetric key cryptography (RSA algorithm), SSL/TLS handshake, Firewalls",
        ],
      },
    ],
    textbooks: [
      {
        title: "Computer Networking: A Top-Down Approach",
        author: "James F. Kurose, Keith W. Ross",
        edition: "8th Edition (Pearson)",
      },
      {
        title: "Computer Networks",
        author: "Andrew S. Tanenbaum, David J. Wetherall",
        edition: "5th Edition (Pearson)",
      },
    ],
    labExperiments: [
      "Network packet sniffing and protocol inspection using Wireshark (HTTP, DNS, TCP, ARP)",
      "Socket Programming in C/Python: TCP Echo Server-Client and Multi-client Chat Server",
      "UDP Socket Programming: Real-time UDP Datagram Communication",
      "Implementation of Cyclic Redundancy Check (CRC) error detection algorithm",
      "Implementation of Dijkstra's Shortest Path Routing Algorithm in C++",
      "Subnetting IP calculation and packet forwarding simulation with Cisco Packet Tracer",
    ],
  },
  {
    id: "cs304-dsa",
    courseCode: "CS304",
    title: "Design & Analysis of Algorithms",
    semester: 4,
    credits: 4,
    totalHours: 45,
    category: "Core Computer Science",
    description:
      "Algorithm design paradigms (Divide-and-Conquer, Greedy, Dynamic Programming, Backtracking, Branch-and-Bound), asymptotic notation, graph algorithms, and NP-Completeness.",
    prerequisites: ["Data Structures & Algorithms"],
    examWeightage: {
      midTermPercent: 30,
      endTermPercent: 50,
      internalAssignmentsPercent: 20,
    },
    units: [
      {
        unitNumber: 1,
        title: "Analysis of Algorithms & Divide and Conquer",
        hours: 9,
        topics: [
          "Asymptotic Notations: Big-O, Big-Omega, Big-Theta, Little-o, Little-omega definitions and mathematical proofs",
          "Recurrence Relations: Substitution method, Recursion Tree method, Master Theorem (all 3 cases)",
          "Divide and Conquer Paradigm: Merge Sort (inversion count), Quick Sort (Lomuto vs Hoare partitioning, randomized quick sort)",
          "Binary Search and variations (Search in Rotated Sorted Array, Peak Element)",
          "Strassen's Matrix Multiplication and complexity comparison",
        ],
      },
      {
        unitNumber: 2,
        title: "Greedy Algorithms",
        hours: 9,
        topics: [
          "Greedy Strategy and optimal substructure property",
          "Fractional Knapsack Problem with proof of optimality",
          "Activity Selection Problem / Interval Scheduling",
          "Huffman Coding: Prefix codes, Optimal Tree construction, Compression ratio",
          "Minimum Spanning Trees: Kruskal's Algorithm (with Disjoint Set Union / DSU by rank and path compression) and Prim's Algorithm",
          "Single-Source Shortest Path: Dijkstra's Algorithm (using Min-Heap priority queue)",
        ],
      },
      {
        unitNumber: 3,
        title: "Dynamic Programming",
        hours: 10,
        topics: [
          "Principle of Optimality, Memoization (Top-Down) vs Tabulation (Bottom-Up)",
          "0/1 Knapsack Problem: Recurrence, DP table construction, and Space optimization",
          "Longest Common Subsequence (LCS) and Longest Increasing Subsequence (LIS)",
          "Matrix Chain Multiplication (MCM) parenthesization and DP table",
          "Bellman-Ford Algorithm for Shortest Paths with Negative Edge Weights and Negative Cycle Detection",
          "All-Pairs Shortest Path: Floyd-Warshall Algorithm (Transitive Closure)",
        ],
      },
      {
        unitNumber: 4,
        title: "Backtracking & Branch and Bound",
        hours: 8,
        topics: [
          "Backtracking technique, State Space Tree exploration",
          "N-Queens Problem, Graph Coloring Problem (m-colorability)",
          "Hamiltonian Cycle Problem and Subset Sum Problem",
          "Branch and Bound: FIFO, LIFO, and Least-Cost (LC) Branch and Bound",
          "Traveling Salesperson Problem (TSP) using Branch and Bound and Dynamic Programming (Bitmasking)",
        ],
      },
      {
        unitNumber: 5,
        title: "String Matching & NP-Completeness",
        hours: 9,
        topics: [
          "String Matching Algorithms: Naive algorithm, Rabin-Karp (rolling hash), Knuth-Morris-Pratt (KMP algorithm with LPS table)",
          "Tractability: Polynomial-time verification, Class P, Class NP, NP-Hard, and NP-Complete",
          "Polynomial-Time Reductions and Cook's Theorem (Boolean Satisfiability / SAT)",
          "Standard NP-Complete Problems: 3-SAT, Clique, Vertex Cover, Set Cover, Subset Sum",
          "Approximation Algorithms for Vertex Cover and Traveling Salesperson Problem",
        ],
      },
    ],
    textbooks: [
      {
        title: "Introduction to Algorithms (CLRS)",
        author: "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
        edition: "4th Edition (MIT Press)",
      },
      {
        title: "Algorithm Design",
        author: "Jon Kleinberg, Éva Tardos",
        edition: "1st Edition (Pearson)",
      },
    ],
    labExperiments: [
      "Implement Merge Sort and Quick Sort; plot execution time vs input size (N = 1000 to 100000)",
      "Implement Fractional Knapsack and Job Sequencing with Deadlines using Greedy approach",
      "Implement 0/1 Knapsack and Longest Common Subsequence using Dynamic Programming",
      "Implement Dijkstra's and Bellman-Ford algorithms for shortest path",
      "Implement N-Queens problem using Backtracking with all distinct board configurations",
      "Implement KMP String Matching algorithm with prefix-suffix calculation",
    ],
  },
];

export class SyllabusService {
  static getAllCourses(): CourseSyllabus[] {
    return BTECH_CSE_SYLLABUS;
  }

  static getCourseById(id: string): CourseSyllabus | undefined {
    return BTECH_CSE_SYLLABUS.find(
      (c) => c.id.toLowerCase() === id.toLowerCase() || c.courseCode.toLowerCase() === id.toLowerCase()
    );
  }

  static getCoursesBySemester(semester: number): CourseSyllabus[] {
    return BTECH_CSE_SYLLABUS.filter((c) => c.semester === semester);
  }
}
