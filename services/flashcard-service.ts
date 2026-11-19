import {
  StudyDeck,
  FlashcardItem,
  QuizQuestion,
  FlashcardRating,
  GenerateStudySetInput,
} from "@/schemas/flashcard";

// In-memory decks repository
const defaultDecks: StudyDeck[] = [
  {
    id: "deck_os_core",
    title: "Operating Systems — High Yield Exam Prep",
    subject: "Operating Systems",
    description: "Deadlocks, CPU Scheduling, Banker's Algorithm, Paging & Virtual Memory.",
    cardCount: 5,
    createdAt: new Date("2024-01-15"),
    cards: [
      {
        id: "fc_os_1",
        deckId: "deck_os_core",
        subject: "Operating Systems",
        topic: "Deadlocks",
        front: "What are the 4 Coffman conditions required for a Deadlock to occur?",
        back: "1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait\n\nAll four conditions must hold simultaneously for a deadlock to persist.",
        mnemonic: "Memory Aid: 'M-H-N-C' -> Many Hostels Need Chai",
        examinerTip: "Always mention that breaking even ONE of these four conditions prevents deadlock.",
        difficulty: "MEDIUM",
        repetitionCount: 1,
        intervalDays: 2,
      },
      {
        id: "fc_os_2",
        deckId: "deck_os_core",
        subject: "Operating Systems",
        topic: "Banker's Algorithm",
        front: "How do you calculate the Need Matrix in Banker's Algorithm?",
        back: "Need[i][j] = Max[i][j] - Allocation[i][j]\n\nWhere Need represents remaining resource instances process P_i may request before finishing.",
        examinerTip: "In numericals, state is safe ONLY if you can output a complete safe sequence like <P1, P3, P4, P0, P2>.",
        difficulty: "EASY",
        repetitionCount: 2,
        intervalDays: 4,
      },
      {
        id: "fc_os_3",
        deckId: "deck_os_core",
        subject: "Operating Systems",
        topic: "Virtual Memory",
        front: "What is Belady's Anomaly and which page replacement algorithm exhibits it?",
        back: "Belady's Anomaly is the counter-intuitive phenomenon where increasing the number of page frames results in MORE page faults.\n\nIt occurs in FIFO (First-In-First-Out) page replacement. Stack algorithms (like LRU and Optimal) NEVER suffer from Belady's Anomaly.",
        examinerTip: "Favorite university viva question: contrast FIFO with LRU page faults.",
        difficulty: "HARD",
        repetitionCount: 0,
        intervalDays: 1,
      },
      {
        id: "fc_os_4",
        deckId: "deck_os_core",
        subject: "Operating Systems",
        topic: "Concurrency",
        front: "What is a Race Condition and how does Peterson's Solution resolve it?",
        back: "A Race Condition occurs when multiple processes access and manipulate shared data concurrently, and outcome depends on execution order.\n\nPeterson's Solution uses two variables: 'turn' and 'flag[2]' to guarantee Mutual Exclusion, Progress, and Bounded Waiting for two processes.",
        difficulty: "MEDIUM",
        repetitionCount: 1,
        intervalDays: 2,
      },
      {
        id: "fc_os_5",
        deckId: "deck_os_core",
        subject: "Operating Systems",
        topic: "Memory Management",
        front: "Explain the difference between Internal and External Fragmentation.",
        back: "Internal Fragmentation: Allocated memory block is slightly larger than requested (wasted space INSIDE partition, e.g. fixed partitioning).\nExternal Fragmentation: Total free memory is sufficient, but storage is broken into small chunks non-contiguously (wasted space OUTSIDE partitions, fixed by compaction).",
        examinerTip: "Paging eliminates external fragmentation but can still cause small internal fragmentation on the last page.",
        difficulty: "EASY",
        repetitionCount: 3,
        intervalDays: 6,
      },
    ],
    quizzes: [
      {
        id: "quiz_os_1",
        deckId: "deck_os_core",
        subject: "Operating Systems",
        topic: "Deadlocks",
        question: "Which of the following conditions is NOT required for a deadlock to occur in an OS?",
        options: [
          "Mutual Exclusion",
          "Circular Wait",
          "Preemptive Scheduling",
          "Hold and Wait",
        ],
        correctIndex: 2,
        explanation: "Deadlock requires NO PREEMPTION. If preemptive scheduling is allowed, the OS can forcibly reclaim resources, preventing deadlock.",
      },
      {
        id: "quiz_os_2",
        deckId: "deck_os_core",
        subject: "Operating Systems",
        topic: "Virtual Memory",
        question: "Belady's Anomaly is observed in which page replacement algorithm?",
        options: [
          "Least Recently Used (LRU)",
          "First-In First-Out (FIFO)",
          "Optimal Page Replacement (OPT)",
          "Most Recently Used (MRU)",
        ],
        correctIndex: 1,
        explanation: "FIFO page replacement can cause more page faults when more frames are allocated. LRU and OPT are stack algorithms and immune to Belady's anomaly.",
      },
      {
        id: "quiz_os_3",
        deckId: "deck_os_core",
        subject: "Operating Systems",
        topic: "Banker's Algorithm",
        question: "In Banker's Algorithm, if Max[i][j] = 7 and Allocation[i][j] = 3, what is Need[i][j]?",
        options: ["10", "4", "2", "Undefined"],
        correctIndex: 1,
        explanation: "Need = Max - Allocation = 7 - 3 = 4.",
      },
    ],
  },
  {
    id: "deck_dbms_core",
    title: "DBMS — Normalization, ACID & Indexing",
    subject: "Database Management Systems",
    description: "BCNF decomposition, 2PL, WAL, B+ Tree indexing, and isolation levels.",
    cardCount: 4,
    createdAt: new Date("2024-01-20"),
    cards: [
      {
        id: "fc_dbms_1",
        deckId: "deck_dbms_core",
        subject: "Database Management Systems",
        topic: "ACID Properties",
        front: "What is Write-Ahead Logging (WAL) and how does it guarantee Atomicity?",
        back: "WAL dictates that log changes (both UNDO and REDO records) MUST be written to stable storage before uncommitted pages are flushed to disk.\n\nOn crash, REDO ensures committed data is saved (Durability) and UNDO reverts partial transactions (Atomicity).",
        examinerTip: "Crucial for 5-mark end-term questions on Transaction Recovery.",
        difficulty: "MEDIUM",
        repetitionCount: 1,
        intervalDays: 3,
      },
      {
        id: "fc_dbms_2",
        deckId: "deck_dbms_core",
        subject: "Database Management Systems",
        topic: "Normalization",
        front: "What is the condition for a relation R to be in Boyce-Codd Normal Form (BCNF)?",
        back: "For every non-trivial functional dependency X -> Y, X MUST be a Superkey.\n\nBCNF is stricter than 3NF (which allows Y to be a prime attribute).",
        examinerTip: "Note: BCNF decomposition is always lossless, but does NOT guarantee dependency preservation.",
        difficulty: "HARD",
        repetitionCount: 0,
        intervalDays: 1,
      },
      {
        id: "fc_dbms_3",
        deckId: "deck_dbms_core",
        subject: "Database Management Systems",
        topic: "Concurrency Control",
        front: "What is Strict Two-Phase Locking (Strict 2PL)?",
        back: "Strict 2PL requires that all Exclusive (write) locks acquired by a transaction must be held until the transaction COMMITS or ABORTS.\n\nThis prevents Cascadeless rollbacks and ensures strict serializability.",
        difficulty: "MEDIUM",
        repetitionCount: 2,
        intervalDays: 5,
      },
      {
        id: "fc_dbms_4",
        deckId: "deck_dbms_core",
        subject: "Database Management Systems",
        topic: "Indexing",
        front: "Why are B+ Trees preferred over B Trees for disk-based database indexes?",
        back: "1. All actual data pointers are stored only in leaf nodes; internal nodes store only keys, maximizing fan-out.\n2. Leaf nodes are linked in a doubly-linked list, making range queries (e.g. BETWEEN x AND y) O(log N + K) and cache-friendly.",
        examinerTip: "Mention higher fan-out leads to shallower tree depth, minimizing disk I/O.",
        difficulty: "EASY",
        repetitionCount: 3,
        intervalDays: 7,
      },
    ],
    quizzes: [
      {
        id: "quiz_dbms_1",
        deckId: "deck_dbms_core",
        subject: "Database Management Systems",
        topic: "Normalization",
        question: "For a functional dependency X -> Y to satisfy BCNF, what must hold?",
        options: [
          "Y must be a prime attribute",
          "X must be a superkey",
          "X must be a candidate key and Y must be non-prime",
          "X and Y must be disjoint",
        ],
        correctIndex: 1,
        explanation: "By definition, a relation is in BCNF if for every non-trivial FD X -> Y, the determinant X is a superkey.",
      },
      {
        id: "quiz_dbms_2",
        deckId: "deck_dbms_core",
        subject: "Database Management Systems",
        topic: "ACID Properties",
        question: "Which component of ACID is guaranteed by concurrency control protocols like 2PL?",
        options: ["Atomicity", "Consistency", "Isolation", "Durability"],
        correctIndex: 2,
        explanation: "Two-Phase Locking (2PL) ensures schedule serializability, which enforces Transaction Isolation.",
      },
    ],
  },
  {
    id: "deck_cn_core",
    title: "Computer Networks — TCP/IP, Routing & Subnetting",
    subject: "Computer Networks",
    description: "3-way handshake, OSI layers, CIDR subnetting, congestion control.",
    cardCount: 4,
    createdAt: new Date("2024-02-01"),
    cards: [
      {
        id: "fc_cn_1",
        deckId: "deck_cn_core",
        subject: "Computer Networks",
        topic: "Transport Layer",
        front: "Explain the TCP Three-Way Handshake process.",
        back: "1. Client -> Server: SYN (seq = x)\n2. Server -> Client: SYN-ACK (seq = y, ack = x + 1)\n3. Client -> Server: ACK (seq = x + 1, ack = y + 1)\n\nThis synchronizes initial sequence numbers before data exchange.",
        examinerTip: "In teardown, TCP uses a 4-way FIN/ACK handshake with a TIME_WAIT state (2*MSL).",
        difficulty: "EASY",
        repetitionCount: 2,
        intervalDays: 4,
      },
      {
        id: "fc_cn_2",
        deckId: "deck_cn_core",
        subject: "Computer Networks",
        topic: "Subnetting",
        front: "In a /26 CIDR subnet, how many total IP addresses and usable host addresses exist?",
        back: "A /26 subnet leaves 32 - 26 = 6 host bits.\n\nTotal IP addresses = 2^6 = 64.\nUsable host addresses = 64 - 2 = 62 (first address is Network ID, last is Broadcast Address).",
        difficulty: "MEDIUM",
        repetitionCount: 1,
        intervalDays: 2,
      },
    ],
    quizzes: [
      {
        id: "quiz_cn_1",
        deckId: "deck_cn_core",
        subject: "Computer Networks",
        topic: "Subnetting",
        question: "How many usable hosts can be assigned in a /28 IPv4 subnet?",
        options: ["16", "14", "30", "12"],
        correctIndex: 1,
        explanation: "32 - 28 = 4 bits -> 2^4 = 16 total. Subtracting Network and Broadcast gives 16 - 2 = 14 usable hosts.",
      },
    ],
  },
];

// User deck storage map: userId -> StudyDeck[]
const userDecksStore = new Map<string, StudyDeck[]>();

export class FlashcardService {
  /**
   * Get all available decks for a user (combines system templates with user-created decks)
   */
  static getDecks(userId: string): StudyDeck[] {
    const userDecks = userDecksStore.get(userId) || [];
    return [...defaultDecks, ...userDecks];
  }

  /**
   * Get single deck by ID
   */
  static getDeckById(userId: string, deckId: string): StudyDeck | null {
    const all = this.getDecks(userId);
    return all.find((d) => d.id === deckId) || null;
  }

  /**
   * Record review of a flashcard using Spaced Repetition (SuperMemo-2 inspired)
   */
  static recordReview(
    userId: string,
    deckId: string,
    cardId: string,
    rating: FlashcardRating
  ): FlashcardItem {
    const deck = this.getDeckById(userId, deckId);
    if (!deck) {
      throw new Error("Study deck not found.");
    }

    const card = deck.cards.find((c) => c.id === cardId);
    if (!card) {
      throw new Error("Flashcard not found.");
    }

    card.lastReviewedAt = new Date();
    card.repetitionCount += 1;

    // Adjust intervals:
    // AGAIN: Forgot / Difficult -> Reset to 1 day
    // GOOD: Recalled with effort -> interval * 2 (or 3 days)
    // EASY: Mastered -> interval * 3 (or 6 days)
    if (rating === "AGAIN") {
      card.intervalDays = 1;
      card.difficulty = "HARD";
    } else if (rating === "GOOD") {
      card.intervalDays = Math.max(2, Math.round(card.intervalDays * 1.8));
      card.difficulty = "MEDIUM";
    } else if (rating === "EASY") {
      card.intervalDays = Math.max(4, Math.round(card.intervalDays * 2.5));
      card.difficulty = "EASY";
    }

    return card;
  }

  /**
   * Synthesize study flashcards and exam quiz from student notes or lecture excerpt
   */
  static async generateStudySet(
    userId: string,
    input: GenerateStudySetInput
  ): Promise<StudyDeck> {
    const deckId = `deck_gen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const topicTitle = input.noteTitle || `${input.subject} Lecture Concepts`;

    // Extract key sentences and concept terms from input text
    const sentences = input.notesText
      .split(/\n|\. /)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);

    const generatedCards: FlashcardItem[] = [];
    const generatedQuizzes: QuizQuestion[] = [];

    // Synthesize high-yield flashcards
    const cardCount = Math.min(input.cardCount, Math.max(3, sentences.length));

    for (let i = 0; i < cardCount; i++) {
      const sentence = sentences[i % sentences.length] || `Core concept in ${input.subject}`;
      const words = sentence.split(" ");
      const keyword = words.slice(0, 4).join(" ");

      generatedCards.push({
        id: `card_gen_${deckId}_${i + 1}`,
        deckId,
        subject: input.subject,
        topic: keyword || input.subject,
        front: `What is the significance of: "${keyword}" in ${input.subject}?`,
        back: `${sentence}.\n\nKey Takeaway: In university exams, clearly highlight the definition, architectural role, and edge-case implications.`,
        examinerTip: `Cite this directly when answering short-note 3-5 mark questions on ${input.subject}.`,
        difficulty: "MEDIUM",
        repetitionCount: 0,
        intervalDays: 1,
      });
    }

    // Synthesize 3 multiple-choice exam questions
    generatedQuizzes.push(
      {
        id: `quiz_gen_${deckId}_1`,
        deckId,
        subject: input.subject,
        topic: generatedCards[0]?.topic || input.subject,
        question: `Regarding ${generatedCards[0]?.topic || input.subject}, which statement is technically accurate according to the lecture?`,
        options: [
          generatedCards[0]?.back.split("\n")[0] || "It strictly preserves system invariant state.",
          "It is completely deprecated and never used in production operating environments.",
          "It requires unbounded execution time with exponential overhead.",
          "It has zero impact on consistency or runtime performance.",
        ],
        correctIndex: 0,
        explanation: `The correct principle is that: ${generatedCards[0]?.back.split("\n")[0]}. The alternative options represent common misconceptions.`,
      },
      {
        id: `quiz_gen_${deckId}_2`,
        deckId,
        subject: input.subject,
        topic: generatedCards[1]?.topic || input.subject,
        question: `When analyzing tradeoffs in ${input.subject}, which metric is prioritized?`,
        options: [
          "Arbitrary uncoordinated execution without locks",
          "Correctness, boundary safety, and predictable latency",
          "Disabling all recovery logs to save disk writes",
          "Ignoring resource constraints under high concurrent load",
        ],
        correctIndex: 1,
        explanation: "Standard university computer science curriculum mandates correctness, boundary safety, and minimal latency over risky shortcuts.",
      }
    );

    const newDeck: StudyDeck = {
      id: deckId,
      title: topicTitle,
      subject: input.subject,
      description: `AI-generated exam study deck from lecture notes (${generatedCards.length} flashcards, ${generatedQuizzes.length} quiz questions).`,
      cardCount: generatedCards.length,
      cards: generatedCards,
      quizzes: generatedQuizzes,
      createdAt: new Date(),
    };

    // Store in user deck cache
    const existing = userDecksStore.get(userId) || [];
    existing.unshift(newDeck);
    userDecksStore.set(userId, existing);

    return newDeck;
  }
}
