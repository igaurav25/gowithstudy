import {
  TutorCourse,
  CourseUnit,
  CourseLesson,
  TutorDifficulty,
  TeachingLanguage,
} from "@/services/tutor/types";
import { DocumentChunk } from "@/lib/rag/types";
import { NotesService } from "@/services/notes-service";
import { chunkDocumentText } from "@/lib/rag/chunker";
import { globalCourseStore } from "@/services/tutor/course-store";

export class CoursePipeline {
  /**
   * Builds an interactive course from an existing student note or uploaded PDF content
   */
  static async generateCourseFromNote(
    userId: string,
    noteId: string,
    options?: {
      targetLevel?: TutorDifficulty;
      preferredLanguage?: TeachingLanguage;
    }
  ): Promise<TutorCourse> {
    const note = await NotesService.getNoteById(noteId, userId);
    const title = note?.title || "Computer Science Course";
    const subject = note?.subject || "Computer Science & Engineering";
    const targetLevel = options?.targetLevel || "COLLEGE_BTECH";
    const preferredLanguage = options?.preferredLanguage || "auto";

    let course: TutorCourse;
    // If predefined curriculum note exists, build standard accredited course with page grounding
    if (noteId === "note_os_01" || subject.toLowerCase().includes("operating system")) {
      course = this.getOperatingSystemsMasterCourse(userId, noteId, targetLevel, preferredLanguage);
    } else if (noteId === "note_dbms_02" || subject.toLowerCase().includes("database")) {
      course = this.getDbmsMasterCourse(userId, noteId, targetLevel, preferredLanguage);
    } else {
      // For arbitrary uploaded notes / PDFs, dynamically generate units and lessons from chunked text
      const rawText = note?.fullNotesText || note?.description || "Course study material";
      const chunks = chunkDocumentText(noteId, title, subject, rawText);

      course = this.synthesizeDynamicCourse(
        userId,
        noteId,
        title,
        subject,
        chunks,
        targetLevel,
        preferredLanguage
      );
    }

    globalCourseStore.set(course.id, course);
    return course;
  }

  /**
   * Master Operating Systems Course grounded in Page References
   */
  static getOperatingSystemsMasterCourse(
    userId: string,
    noteId = "note_os_01",
    targetLevel: TutorDifficulty = "COLLEGE_BTECH",
    preferredLanguage: TeachingLanguage = "auto"
  ): TutorCourse {
    const units: CourseUnit[] = [
      {
        id: "unit_os_1",
        unitNumber: 1,
        title: "Process Scheduling & CPU Allocation",
        overview: "Foundations of CPU scheduling, Preemptive vs Non-preemptive policies, and performance metrics (TAT, WT).",
        topics: ["Process States", "FCFS & SJF", "Round Robin Scheduling", "Priority & Aging"],
        sourcePages: [4, 5, 6],
        lessons: [
          {
            id: "lesson_os_1_1",
            unitId: "unit_os_1",
            lessonNumber: 1,
            title: "CPU Scheduling Algorithms: FCFS vs SJF",
            conceptSummary: "Shortest Job First (SJF) is provably optimal for minimizing average waiting time, while FCFS is simple but suffers from the Convoy Effect.",
            pageReference: 4,
            keyFormulasOrTerms: ["Turnaround Time (TAT) = CT - AT", "Waiting Time (WT) = TAT - BT", "Convoy Effect"],
            steps: [
              {
                stepNumber: 0,
                title: "1. Definition & Core Objective",
                phase: "DEFINITION",
                content: `### 📌 Core Definition
CPU Scheduling is the process by which the operating system decides which runnable process in the **Ready Queue** gets allocated the CPU core.

**The Two Fundamental Scheduling Formulas:**
* **Turnaround Time (TAT)**: $\\text{Completion Time (CT)} - \\text{Arrival Time (AT)}$
* **Waiting Time (WT)**: $\\text{Turnaround Time (TAT)} - \\text{Burst Time (BT)}$`,
                spokenScript:
                  "Welcome to Lesson 1. CPU Scheduling is how the OS picks which process gets CPU time from the Ready Queue. Remember: Turnaround Time is Completion Time minus Arrival Time, and Waiting Time is Turnaround Time minus Burst Time.",
                pageCitation: { title: "Operating Systems Lecture Notes", pageNumber: 4 },
              },
              {
                stepNumber: 1,
                title: "2. The Grocery Checkout Analogy",
                phase: "ANALOGY",
                content: `### 🛒 Intuition & Real-World Analogy
Imagine a single cashier at a supermarket checkout:
* **FCFS (First-Come, First-Served)**: A person with 1 chocolate bar is stuck waiting behind a customer with 3 overflowing shopping carts. The short customer waits 45 minutes for a 10-second checkout! This is the infamous **Convoy Effect**.
* **SJF (Shortest Job First)**: The cashier lets people with 1 or 2 items checkout first. Total store-wide waiting time drops dramatically!`,
                spokenScript:
                  "Think of a supermarket checkout line. Under First-Come First-Served, a person buying one bottle of water waits 45 minutes behind someone with three full shopping carts. That's the convoy effect! Shortest Job First lets quick buyers go first.",
                pageCitation: { title: "Operating Systems Lecture Notes", pageNumber: 4 },
              },
              {
                stepNumber: 2,
                title: "3. Technical Trade-offs & Burst Prediction",
                phase: "MECHANICS",
                content: `### ⚙️ Why can't SJF be implemented in standard long-term schedulers?
While SJF is provably optimal for average waiting time, the operating system **cannot know the future CPU burst time** in advance!
Schedulers estimate future burst time using **exponential smoothing**:
$$\\tau_{n+1} = \\alpha \\cdot t_n + (1 - \\alpha) \\cdot \\tau_n$$
Where $t_n$ is the most recent actual burst, and $\\tau_n$ is the past predicted average.`,
                spokenScript:
                  "SJF is mathematically optimal for minimum average waiting time. But here's the catch: the OS can't see the future to know how long a process will run! It predicts bursts using exponential smoothing.",
                pageCitation: { title: "Operating Systems Lecture Notes", pageNumber: 5 },
              },
              {
                stepNumber: 3,
                title: "4. Practical Code & Gantt Chart Calculation",
                phase: "CODE_APPLICATION",
                content: `### 💻 Gantt Chart Calculation Example
Suppose we have 3 processes arriving at $t=0$:
* $P_1$: Burst = 24 ms
* $P_2$: Burst = 3 ms
* $P_3$: Burst = 3 ms

**Under FCFS ($P_1 \\to P_2 \\to P_3$):**
Average Waiting Time = $(0 + 24 + 27) / 3 = 17\\text{ ms}$.

**Under SJF ($P_2 \\to P_3 \\to P_1$):**
Average Waiting Time = $(0 + 3 + 6) / 3 = 3\\text{ ms}$! *(An 82% reduction in waiting time!)*`,
                spokenScript:
                  "Look at this Gantt chart: with three processes, FCFS gives an average wait of 17 milliseconds. Reordering them with SJF drops the average wait to just 3 milliseconds!",
                pageCitation: { title: "Operating Systems Lecture Notes", pageNumber: 5 },
              },
            ],
            checkQuestion: {
              id: "cq_os_1",
              question: "Why is Shortest Job First (SJF) difficult to implement directly in general-purpose operating systems?",
              options: [
                "It causes excessive context-switch overhead compared to Round Robin",
                "The length of the next CPU burst cannot be known in advance by the OS",
                "It always violates the mutual exclusion requirement",
                "It requires all processes to have identical priority levels",
              ],
              correctIndex: 1,
              explanation: "SJF requires prior knowledge of how long a process will compute before yielding, which is impossible to know with certainty without predictive heuristics.",
              misconceptionRemedy: {
                0: "Round Robin actually has higher context switching than SJF because of its periodic timer interrupts. The core limitation of SJF is unknown burst duration.",
                2: "Mutual exclusion is a synchronization requirement for critical sections, not a CPU scheduling constraint.",
                3: "Priority levels are part of Priority Scheduling, not a prerequisite for SJF.",
              },
            },
          },
          {
            id: "lesson_os_1_2",
            unitId: "unit_os_1",
            lessonNumber: 2,
            title: "Round Robin Scheduling & Time Quantum Tuning",
            conceptSummary: "Round Robin allocates each process a time quantum (q). The selection of q dictates whether RR behaves like FCFS or introduces thrashing context switches.",
            pageReference: 5,
            keyFormulasOrTerms: ["Time Quantum (q)", "Context Switch Cost", "Rule of Thumb: 80% rule"],
            steps: [
              {
                stepNumber: 0,
                title: "1. Round Robin Mechanism",
                phase: "DEFINITION",
                content: `### 🔄 Round Robin (RR)
Round Robin is specifically designed for time-sharing systems. The CPU scheduler allocates each process a small unit of CPU time called a **Time Quantum** ($q$), typically 10 to 100 milliseconds.

When the quantum expires, the process is preempted and placed at the tail of the ready queue.`,
                spokenScript:
                  "Round Robin is the heartbeat of interactive operating systems. Each process gets a turn with a time slice called a quantum. When time is up, the OS preempts it and moves to the next.",
                pageCitation: { title: "Operating Systems Lecture Notes", pageNumber: 5 },
              },
              {
                stepNumber: 1,
                title: "2. The Quantum Dilemma",
                phase: "MECHANICS",
                content: `### ⚖️ The Quantum Size Trade-off:
* **If $q$ is extremely large ($q \\to \\infty$)**: Round Robin degenerates directly into **FCFS**.
* **If $q$ is extremely small ($q \\approx 0$)**: The system suffers from catastrophic **Context-Switch Overhead**. The CPU spends more time saving/restoring registers than executing real work!

> 🎓 **Academic Rule of Thumb**: About **80% of CPU bursts** should be shorter than the time quantum $q$.`,
                spokenScript:
                  "Here is the golden rule: if your quantum is too large, Round Robin turns into First-Come First-Served. If it is too small, your CPU wastes all its energy switching registers rather than running user programs. Aim for 80 percent of bursts to finish within the quantum.",
                pageCitation: { title: "Operating Systems Lecture Notes", pageNumber: 5 },
              },
            ],
            checkQuestion: {
              id: "cq_os_2",
              question: "What happens if the time quantum (q) in a Round Robin scheduler is set arbitrarily large?",
              options: [
                "The system enters livelock due to interrupt storming",
                "The scheduling algorithm degenerates into First-Come First-Served (FCFS)",
                "Average turnaround time becomes provably optimal",
                "All processes starve indefinitely",
              ],
              correctIndex: 1,
              explanation: "If the quantum exceeds the longest process burst time, every process completes in arrival order without preemption, exactly identical to FCFS.",
              misconceptionRemedy: {
                0: "Interrupt storms occur with microscopic quanta, not huge quanta.",
                2: "SJF is the optimal algorithm for average waiting time, not large-quantum Round Robin.",
                3: "No starvation occurs; every process simply finishes in its arrival order.",
              },
            },
          },
        ],
      },
      {
        id: "unit_os_2",
        unitNumber: 2,
        title: "Deadlock Avoidance & Banker's Algorithm",
        overview: "Understanding Coffman's 4 conditions, Resource Allocation Graphs, Safe States, and Dijkstra's Banker's Algorithm.",
        topics: ["Deadlock Conditions", "Safe State", "Banker's Algorithm", "Resource Request"],
        sourcePages: [7, 8, 9],
        lessons: [
          {
            id: "lesson_os_2_1",
            unitId: "unit_os_2",
            lessonNumber: 1,
            title: "Coffman's 4 Conditions & Deadlock Characterization",
            conceptSummary: "A deadlock can occur if and only if all four Coffman conditions hold simultaneously: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait.",
            pageReference: 7,
            keyFormulasOrTerms: ["Mutual Exclusion", "Hold & Wait", "No Preemption", "Circular Wait"],
            steps: [
              {
                stepNumber: 0,
                title: "1. The 4 Necessary Conditions",
                phase: "DEFINITION",
                content: `### 🔒 Deadlock Conditions (Coffman, 1971)
Deadlock occurs when processes are blocked waiting for resources held by each other. All 4 must be true simultaneously:

1. **Mutual Exclusion**: At least one resource is held in non-shareable mode.
2. **Hold and Wait**: A process holds one resource while waiting to acquire another.
3. **No Preemption**: Resources cannot be confiscated; only released voluntarily.
4. **Circular Wait**: $P_0$ waits for $P_1$, $P_1$ waits for $P_2$, ..., and $P_n$ waits for $P_0$.`,
                spokenScript:
                  "For a deadlock to occur, all four Coffman conditions must hold at the same time: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Break any one of these four, and deadlock becomes impossible.",
                pageCitation: { title: "Operating Systems Lecture Notes", pageNumber: 7 },
              },
              {
                stepNumber: 1,
                title: "2. The Narrow Bridge Analogy",
                phase: "ANALOGY",
                content: `### 🌉 The Narrow Bridge Analogy
Think of a narrow, single-lane bridge:
* Cars from the North and South enter the bridge at the same time.
* Neither car can pass through the other (Mutual Exclusion).
* Both drivers refuse to reverse (No Preemption).
* Each driver holds their half of the bridge while waiting for the other half (Hold and Wait).
* Gridlock results! The only solution is to back up (preemption).`,
                spokenScript:
                  "Picture two cars meeting on a one-lane bridge. Neither can pass through the other, and neither is willing to back up. That is deadlock in everyday life!",
                pageCitation: { title: "Operating Systems Lecture Notes", pageNumber: 7 },
              },
            ],
            checkQuestion: {
              id: "cq_os_3",
              question: "How can an operating system guarantee that deadlocks will never occur by prevention?",
              options: [
                "By ensuring that at least one of the four Coffman conditions cannot hold",
                "By increasing total RAM so every process has infinite memory",
                "By running all processes strictly concurrently without locks",
                "By terminating the operating system whenever a resource is requested",
              ],
              correctIndex: 0,
              explanation: "Deadlock prevention works by invalidating at least one of the four necessary conditions (e.g. imposing total resource ordering to eliminate circular wait).",
              misconceptionRemedy: {
                1: "Hardware resources like printers, file locks, and semaphores are limited regardless of RAM size.",
                2: "Running without locks would destroy data consistency and cause race conditions.",
                3: "Terminating the OS makes the system unusable.",
              },
            },
          },
        ],
      },
    ];

    return {
      id: `course_os_${Date.now()}`,
      userId,
      sourceNoteId: noteId,
      title: "Operating Systems — Interactive Master Course",
      subject: "Operating Systems",
      targetLevel,
      preferredLanguage,
      totalLessons: 3,
      units,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Master Database Management Systems Course
   */
  static getDbmsMasterCourse(
    userId: string,
    noteId = "note_dbms_02",
    targetLevel: TutorDifficulty = "COLLEGE_BTECH",
    preferredLanguage: TeachingLanguage = "auto"
  ): TutorCourse {
    const units: CourseUnit[] = [
      {
        id: "unit_dbms_1",
        unitNumber: 1,
        title: "Relational Database Design & Normalization",
        overview: "Functional dependencies, anomalies (insert/update/delete), and standard normal forms (1NF, 2NF, 3NF, BCNF).",
        topics: ["Functional Dependencies", "1NF to 3NF", "Boyce-Codd Normal Form (BCNF)", "Lossless Decomposition"],
        sourcePages: [2, 3, 4],
        lessons: [
          {
            id: "lesson_dbms_1_1",
            unitId: "unit_dbms_1",
            lessonNumber: 1,
            title: "Database Normalization: From 1NF to BCNF",
            conceptSummary: "Normalization eliminates data redundancy and prevents modification anomalies by decomposing unnormalized relations into higher normal forms.",
            pageReference: 2,
            keyFormulasOrTerms: ["Functional Dependency (X -> Y)", "Candidate Key", "BCNF Criterion: X must be Superkey"],
            steps: [
              {
                stepNumber: 0,
                title: "1. What is Normalization?",
                phase: "DEFINITION",
                content: `### 🗄️ Database Normalization
Normalization is the systematic design technique of organizing tables to minimize data redundancy and avoid anomalies:
* **Update Anomaly**: Changing an employee address requires updating 500 rows.
* **Insertion Anomaly**: Cannot record a new department until an employee is hired.
* **Deletion Anomaly**: Deleting the last employee in a department erases the department records!`,
                spokenScript:
                  "Database normalization is how we design relational tables to eliminate redundancy and prevent dangerous insertion, deletion, and update anomalies.",
                pageCitation: { title: "DBMS Lecture Notes", pageNumber: 2 },
              },
              {
                stepNumber: 1,
                title: "2. The Normal Forms Hierarchy",
                phase: "MECHANICS",
                content: `### 🪜 Step-by-Step Normal Forms:
1. **1NF**: Every column value is atomic (no comma-separated lists or repeating groups).
2. **2NF**: In 1NF + **No Partial Dependency** (no non-prime attribute depends on a proper subset of candidate key).
3. **3NF**: In 2NF + **No Transitive Dependency** (no non-prime depends on another non-prime).
4. **BCNF**: For every non-trivial $X \\to Y$, **$X$ MUST be a superkey**!`,
                spokenScript:
                  "Here is the progression: First normal form requires atomic values. Second normal form removes partial dependencies. Third normal form removes transitive dependencies. And BCNF requires that the determinant is always a superkey.",
                pageCitation: { title: "DBMS Lecture Notes", pageNumber: 3 },
              },
            ],
            checkQuestion: {
              id: "cq_dbms_1",
              question: "For a relational schema to be in Boyce-Codd Normal Form (BCNF), what condition must hold for every non-trivial functional dependency X -> Y?",
              options: [
                "Y must be a prime attribute",
                "X must be a superkey of the relation",
                "X and Y must belong to different tables",
                "The relation must have at least three candidate keys",
              ],
              correctIndex: 1,
              explanation: "In BCNF, the determinant X in every non-trivial functional dependency X -> Y must strictly be a superkey.",
              misconceptionRemedy: {
                0: "Y being a prime attribute satisfies 3NF, but is NOT sufficient for BCNF!",
                2: "Functional dependencies are evaluated within the same relation schema.",
                3: "A relation can be in BCNF with exactly one candidate key.",
              },
            },
          },
        ],
      },
    ];

    return {
      id: `course_dbms_${Date.now()}`,
      userId,
      sourceNoteId: noteId,
      title: "DBMS & SQL Architecture — Master Interactive Course",
      subject: "Database Management Systems",
      targetLevel,
      preferredLanguage,
      totalLessons: 1,
      units,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generates a dynamic course outline from arbitrary chunked PDF or study notes
   */
  private static synthesizeDynamicCourse(
    userId: string,
    noteId: string,
    title: string,
    subject: string,
    chunks: DocumentChunk[],
    targetLevel: TutorDifficulty,
    preferredLanguage: TeachingLanguage
  ): TutorCourse {
    const units: CourseUnit[] = [];
    const chunkSize = Math.max(1, Math.ceil(chunks.length / 3));

    for (let u = 0; u < Math.min(3, Math.ceil(chunks.length / chunkSize)); u++) {
      const unitChunks = chunks.slice(u * chunkSize, (u + 1) * chunkSize);
      const unitNumber = u + 1;
      const unitTitle = `Unit ${unitNumber}: Core Concepts & Principles`;

      const lessons: CourseLesson[] = unitChunks.slice(0, 2).map((chunk, lIdx) => {
        const lessonNumber = lIdx + 1;
        const pageNum = chunk.pageNumber || unitNumber;

        return {
          id: `lesson_${noteId}_${u}_${lIdx}`,
          unitId: `unit_${noteId}_${u}`,
          lessonNumber,
          title: `Topic ${lessonNumber}: ${chunk.keywords?.slice(0, 3).join(", ") || "Foundations"}`,
          conceptSummary: chunk.content.slice(0, 140) + "...",
          pageReference: pageNum,
          keyFormulasOrTerms: chunk.keywords?.slice(0, 4) || [],
          steps: [
            {
              stepNumber: 0,
              title: "1. Definition & Core Concept",
              phase: "DEFINITION",
              content: `### 📖 Concept Overview\n\n${chunk.content}`,
              spokenScript: `In this lesson, we explore the core principles outlined on page ${pageNum} of your course material.`,
              pageCitation: { title, pageNumber: pageNum },
            },
            {
              stepNumber: 1,
              title: "2. Practical Breakdown & Application",
              phase: "MECHANICS",
              content: `### 💡 Key Takeaway & Analysis\n\nCarefully review the relationships between: **${(chunk.keywords || []).join(", ")}**.\n\n> 🎓 **Exam Tip**: Ground your numerical solutions and architectural answers using the exact definitions established in your accredited curriculum.`,
              spokenScript: `Notice how these key concepts connect together. In university exams, be sure to structure your answers around these fundamental definitions.`,
              pageCitation: { title, pageNumber: pageNum },
            },
          ],
          checkQuestion: {
            id: `cq_${noteId}_${u}_${lIdx}`,
            question: `Which of the following best reflects the core principle discussed in this topic?`,
            options: [
              `The established theoretical principles on Page ${pageNum}`,
              "Ignoring system constraints during execution",
              "Disabling validation checks to save CPU cycles",
              "Assuming infinite hardware bandwidth",
            ],
            correctIndex: 0,
            explanation: `The concepts on Page ${pageNum} establish the foundational constraints and definitions for this subject.`,
            misconceptionRemedy: {
              1: "Real systems must always observe physical hardware and concurrency constraints.",
              2: "Disabling validation leads to silent memory corruption and unrecoverable bugs.",
              3: "Physical memory and bus bandwidth are always finite.",
            },
          },
        };
      });

      units.push({
        id: `unit_${noteId}_${u}`,
        unitNumber,
        title: unitTitle,
        overview: `Detailed review of foundational concepts from your course documents.`,
        topics: unitChunks.flatMap((c) => c.keywords || []).slice(0, 5),
        sourcePages: Array.from(new Set(unitChunks.map((c) => c.pageNumber || 1))),
        lessons,
      });
    }

    const totalLessons = units.reduce((acc, u) => acc + u.lessons.length, 0);

    return {
      id: `course_dyn_${Date.now()}`,
      userId,
      sourceNoteId: noteId,
      title,
      subject,
      targetLevel,
      preferredLanguage,
      totalLessons,
      units,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
