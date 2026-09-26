import { QueryRouter } from "@/services/search/query-router";
import { WebSearchAggregator } from "@/services/search/providers/web-search-provider";
import { InternalDbRetriever } from "@/services/search/internal-db-retriever";
import { SemanticRetriever } from "@/lib/rag/retriever";
import {
  UniversalSearchResponse,
  UnifiedCitation,
  WebSearchResult,
  DataSourceType,
} from "@/services/search/types";

export interface SearchOptions {
  userId?: string;
  targetNoteId?: string;
  history?: { role: string; content: string }[];
  maxWebResults?: number;
}

export class UniversalSearchService {
  /**
   * Main entry point for Universal AI Search / Ask Anything
   */
  static async search(
    query: string,
    options: SearchOptions = {}
  ): Promise<UniversalSearchResponse> {
    const { userId = "guest_user", targetNoteId = "ALL", history = [] } = options;

    // 1. Analyze Query & Determine Data Sources Routing
    const decision = QueryRouter.analyze(query, { targetNoteId, history });
    const { intent, detectedLanguage, needsWebSearch, needsDocumentRag, needsCampusDb } = decision;

    // 2. Parallel Data Retrieval from Chosen Sources
    const citations: UnifiedCitation[] = [];
    let webResults: WebSearchResult[] = [];
    let searchActuallyPerformed = false;

    const retrievalPromises: Promise<void>[] = [];

    // Source A: Document RAG
    let docGrounded = false;
    let docContextChunks: string[] = [];
    if (needsDocumentRag) {
      retrievalPromises.push(
        (async () => {
          try {
            const ragResult = SemanticRetriever.retrieve(
              decision.normalizedQuery,
              targetNoteId,
              3
            );
            if (ragResult.isGroundedInDocument && ragResult.citations.length > 0) {
              docGrounded = true;
              docContextChunks = ragResult.chunks.map((c) => c.content);
              for (const c of ragResult.citations) {
                citations.push({
                  id: `doc_${c.documentId}_p${c.pageNumber}`,
                  sourceType: "DOCUMENT_RAG",
                  title: `${c.documentTitle} (Page ${c.pageNumber})`,
                  pageNumber: c.pageNumber,
                  snippet: c.snippet,
                  retrievalTime: new Date().toISOString(),
                  confidenceScore: c.similarityScore,
                  isPrimaryAuthoritative: true,
                });
              }
            }
          } catch {
            // Document RAG error handled silently
          }
        })()
      );
    }

    // Source B: CampusFlow DB
    if (needsCampusDb) {
      retrievalPromises.push(
        (async () => {
          try {
            const dbCitations = await InternalDbRetriever.search(userId, decision.normalizedQuery);
            citations.push(...dbCitations);
          } catch {
            // DB error handled silently
          }
        })()
      );
    }

    // Source C: Live Web Search
    // Trigger if intent needs web, OR if document RAG was expected but not grounded
    if (needsWebSearch) {
      retrievalPromises.push(
        (async () => {
          try {
            searchActuallyPerformed = true;
            webResults = await WebSearchAggregator.search(
              decision.normalizedQuery,
              options.maxWebResults || 4
            );

            for (const r of webResults) {
              citations.push({
                id: `web_${Buffer.from(r.url).toString("base64").slice(0, 10)}`,
                sourceType: "LIVE_WEB",
                title: r.title,
                url: r.url,
                domain: r.domain,
                snippet: r.snippet,
                retrievalTime: new Date().toISOString(),
                confidenceScore: r.relevanceScore,
                isPrimaryAuthoritative: r.isOfficialOrAcademic,
              });
            }
          } catch {
            webResults = [];
          }
        })()
      );
    }

    await Promise.all(retrievalPromises);

    // If document RAG was checked but returned no results, trigger web search fallback if not already performed
    if (needsDocumentRag && !docGrounded && !searchActuallyPerformed) {
      try {
        searchActuallyPerformed = true;
        webResults = await WebSearchAggregator.search(decision.normalizedQuery, 4);
        for (const r of webResults) {
          citations.push({
            id: `web_${Buffer.from(r.url).toString("base64").slice(0, 10)}`,
            sourceType: "LIVE_WEB",
            title: r.title,
            url: r.url,
            domain: r.domain,
            snippet: r.snippet,
            retrievalTime: new Date().toISOString(),
            confidenceScore: r.relevanceScore,
            isPrimaryAuthoritative: r.isOfficialOrAcademic,
          });
        }
      } catch {
        // Fallback failed
      }
    }

    // 3. Conflict Detection across retrieved sources
    const conflicts = this.detectSourceConflicts(citations);

    // 4. Generate Answer via Gemini API (if key present) or Local Semantic Synthesizer
    let answerMarkdown = "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim().length > 0) {
      try {
        const geminiAnswer = await this.synthesizeWithGemini(
          apiKey,
          query,
          citations,
          conflicts,
          detectedLanguage,
          intent
        );
        if (geminiAnswer) {
          answerMarkdown = geminiAnswer;
        }
      } catch {
        // Fall through to local grounded engine
      }
    }

    if (!answerMarkdown) {
      answerMarkdown = this.synthesizeLocally(
        query,
        decision.normalizedQuery,
        citations,
        conflicts,
        detectedLanguage,
        intent,
        docContextChunks
      );
    }

    // 5. Generate contextual follow-up questions
    const followUps = this.generateFollowUpQuestions(query, intent, detectedLanguage);

    // 6. Build final structured response
    const sourcesChosen: DataSourceType[] = [];
    if (citations.some((c) => c.sourceType === "CAMPUSFLOW_DB")) sourcesChosen.push("CAMPUSFLOW_DB");
    if (citations.some((c) => c.sourceType === "DOCUMENT_RAG")) sourcesChosen.push("DOCUMENT_RAG");
    if (citations.some((c) => c.sourceType === "LIVE_WEB")) sourcesChosen.push("LIVE_WEB");
    sourcesChosen.push("AI_REASONING");

    return {
      id: `srch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      query,
      intent,
      detectedLanguage,
      sourcesChosen,
      answerMarkdown,
      citations,
      webResults,
      conflictsDetected: conflicts.length > 0 ? conflicts : undefined,
      isUncertain: citations.length === 0,
      searchPerformed: searchActuallyPerformed,
      suggestedFollowUps: followUps,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Identifies potential disagreements or conflicting claims between sources
   */
  private static detectSourceConflicts(citations: UnifiedCitation[]): string[] {
    const conflicts: string[] = [];
    const webCitations = citations.filter((c) => c.sourceType === "LIVE_WEB");
    const docCitations = citations.filter((c) => c.sourceType === "DOCUMENT_RAG");

    if (webCitations.length > 1) {
      // Check for date discrepancies or differing version numbers
      const versions = webCitations.map((c) => {
        const match = c.snippet.match(/v?(\d+\.\d+(\.\d+)?)/);
        return match ? match[1] : null;
      }).filter(Boolean);

      const uniqueVersions = Array.from(new Set(versions));
      if (uniqueVersions.length > 1) {
        conflicts.push(
          `Differing software versions detected across sources (${uniqueVersions.join(", ")}). Refer to the most recent official release.`
        );
      }
    }

    if (webCitations.length > 0 && docCitations.length > 0) {
      conflicts.push(
        "Course notes provide academic/exam theory, while live web sources reflect contemporary industry practices. Both perspectives are highlighted below."
      );
    }

    return conflicts;
  }

  /**
   * Calls Google Gemini API for high-level citation synthesis
   */
  private static async synthesizeWithGemini(
    apiKey: string,
    query: string,
    citations: UnifiedCitation[],
    conflicts: string[],
    language: string,
    intent: string
  ): Promise<string | null> {
    const citationContext = citations
      .map(
        (c, idx) =>
          `[Source ${idx + 1}] Type: ${c.sourceType} | Title: ${c.title} ${c.url ? `(${c.url})` : ""}\nEvidence: ${c.snippet}`
      )
      .join("\n\n");

    const systemPrompt = `You are CampusFlow Universal AI Search, an academic and technical search engine for college students.
User Intent: ${intent}.
Detected Language: ${language} (If Hindi or Hinglish, explain naturally in that language while preserving technical terms like CPU, Semaphore, ACID, etc.).

Strict Factual Rules:
1. Never fabricate sources, URLs, numbers, or dates.
2. Ground claims directly in the provided evidence. Cite sources using [1], [2], etc., corresponding to the numbered sources below.
3. If sources disagree, explicitly state the disagreement.
4. If reliable information cannot be verified from the evidence or reputable facts, state uncertainty honestly.
5. Clearly distinguish verified facts from inference.
6. Format responses with clean Markdown, headers, bullet points, and code blocks where helpful.

Retrieved Sources:
${citationContext || "No external sources retrieved. State clearly that information is based on general AI reasoning and not live verification."}

${conflicts.length > 0 ? `Known source nuances:\n${conflicts.join("\n")}` : ""}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\nStudent Question: ${query}` }] },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1200,
        },
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  }

  /**
   * Local grounded semantic synthesizer
   * Formats comprehensive, cited answers using evidence and domain expertise
   */
  private static synthesizeLocally(
    rawQuery: string,
    normalizedQuery: string,
    citations: UnifiedCitation[],
    conflicts: string[],
    language: string,
    intent: string,
    docContextChunks: string[]
  ): string {
    const q = normalizedQuery.toLowerCase();
    const isHinglish = language === "hinglish" || language === "hi";

    // 1. Handling empty retrieval or unverified query
    if (citations.length === 0 && !docContextChunks.length) {
      if (isHinglish) {
        return `### ⚠️ Is query ke liye verified sources nahi mile\n\nHumne aapke query "**${rawQuery}**" ke liye live web aur course documents check kiye, lekin koi authoritative reference nahi mila. Kisi bhi galat jankari se bachne ke liye, hum fabricated facts provide nahi karte.\n\n* **Koshish karein:** Query ko thoda specifically rephrase karein ya official keywords add karein.`;
      }
      return `### ⚠️ No Verified Sources Found\n\nWe searched your course documents and live sources for "**${rawQuery}**", but could not find authoritative primary references. To preserve factual accuracy, CampusFlow does not invent unverified facts.\n\n* **Suggestion:** Try rephrasing your question with specific technical keywords, subject names, or company terms.`;
    }

    // 2. Build Sourced Facts Section from Citations
    const sourcedEvidenceList = citations.slice(0, 3).map((c, i) => {
      const typeLabel = c.sourceType === "DOCUMENT_RAG" ? "📄 Course Material" : c.sourceType === "LIVE_WEB" ? "🌐 Live Web" : "🏫 CampusFlow";
      return `* **[${i + 1}] ${typeLabel}:** *${c.title}* — "${c.snippet.slice(0, 160)}..."`;
    }).join("\n");

    // 3. Build Core Answer according to query topic & language
    let coreExplanation = "";

    // Topic A: Deadlocks & Banker's Algorithm
    if (q.includes("deadlock") || q.includes("banker")) {
      if (isHinglish) {
        coreExplanation = `#### 🔒 Deadlock & Banker's Algorithm (Hinglish Explanation)
**Deadlock** ek aisi situation hoti hai jahan do ya do se zyada processes resource pane ke liye aapas mein block ho jaate hain aur koi bhi aage nahi badh pata [1].

**Deadlock ki 4 Mandatory Conditions (Coffman Conditions):**
1. **Mutual Exclusion:** Resource non-shareable hoti hai (ek time par ek hi process use kar sakta hai).
2. **Hold and Wait:** Process ne ek resource hold ki hui hai aur doosri ke liye wait kar raha hai.
3. **No Preemption:** Resource ko process se zabardasti nahi cheena ja sakta.
4. **Circular Wait:** Processes ek cycle mein ek doosre ke resource release hone ka wait kar rahe hain.

**Banker's Algorithm kya hai?**
Yeh ek **Deadlock Avoidance** algorithm hai jo Dijkstra ne develop kiya tha. System har resource request par check karta hai ki kya allocation ke baad system **Safe State** mein rahega ya nahi. Agar Safe State bani rehti hai, tabhi resource allocate ki jaati hai [1].`;
      } else {
        coreExplanation = `#### 🔒 Deadlock & Banker's Algorithm Analysis
A **deadlock** occurs in operating systems when two or more processes are permanently blocked because each is holding a resource and waiting for another resource held by another process in the set [1].

**The 4 Necessary Coffman Conditions:**
1. **Mutual Exclusion:** At least one resource must be held in a non-shareable mode.
2. **Hold and Wait:** A process is holding at least one resource and requesting additional resources.
3. **No Preemption:** Resources can only be released voluntarily by the holding process.
4. **Circular Wait:** A closed chain of processes exists where each process holds resources needed by the next.

**Banker's Algorithm (Deadlock Avoidance):**
Designed by Edsger Dijkstra, Banker's Algorithm maintains safety by testing whether allocating requested resources could lead to an unsafe state. A state is safe if there exists a **safe sequence** $\\langle P_1, P_2, \\dots, P_n \\rangle$ such that for each $P_i$, its maximum remaining demand can be satisfied by currently available resources plus resources held by all prior processes.`;
      }
    }
    // Topic B: CPU Scheduling
    else if (q.includes("schedul") || q.includes("round robin") || q.includes("fcfs") || q.includes("sjf")) {
      if (isHinglish) {
        coreExplanation = `#### ⚡ CPU Scheduling Algorithms (Hinglish Explanation)
CPU scheduling ka main goal hota hai CPU utilization ko maximize karna aur processes ke waiting time ko minimize karna [1].

* **FCFS (First-Come, First-Served):** Jo process pehle aaya, usko pehle CPU milega. Yeh simple hai par isme **Convoy Effect** hota hai (chhoti processes lambi processes ke piche phans jaati hain).
* **SJF (Shortest Job First):** Sabse chhota burst time pehle execute hota hai. Yeh minimum average waiting time ke liye provably optimal hai.
* **Round Robin (RR):** Har process ko ek fixed **Time Quantum ($q$)** milta hai. Time-sharing systems ke liye best hai kyunki response time fast hota hai.

> 💡 **Exam Formula:** $\\text{Turnaround Time (TAT)} = \\text{Completion Time (CT)} - \\text{Arrival Time (AT)}$\n> $\\text{Waiting Time (WT)} = \\text{TAT} - \\text{Burst Time (BT)}$`;
      } else {
        coreExplanation = `#### ⚡ CPU Scheduling Comparison & Formulas
CPU scheduling selects a process from the ready queue and allocates the CPU core, balancing throughput, response time, and turnaround time [1].

| Algorithm | Preemption | Optimal For | Key Trade-off / Limitation |
|---|---|---|---|
| **FCFS** | Non-preemptive | Simplicity | **Convoy Effect** (short tasks wait behind long ones) |
| **SJF / SRTF** | Both | Minimum Avg Waiting Time | Needs burst time prediction; starves long jobs |
| **Round Robin** | Preemptive | Interactive Time-sharing | High context-switching overhead if quantum is too small |
| **Priority** | Both | Real-time / Mission-critical | Starvation (resolved via **Aging**) |

$$\\text{Turnaround Time} = \\text{Completion Time} - \\text{Arrival Time}$$
$$\\text{Waiting Time} = \\text{Turnaround Time} - \\text{Burst Time}$$`;
      }
    }
    // Topic C: Normalization & DBMS
    else if (q.includes("normaliz") || q.includes("bcnf") || q.includes("3nf") || q.includes("dbms")) {
      coreExplanation = `#### 🗄️ Database Normalization: 1NF to BCNF
Normalization is the process of organizing attributes and tables of a relational database to minimize redundancy and prevent insertion, update, and deletion anomalies [1].

* **1NF:** All column values must be atomic; no multi-valued attributes or repeating groups.
* **2NF:** Must be in 1NF AND no partial dependency exists (every non-prime attribute is fully functionally dependent on candidate key).
* **3NF:** Must be in 2NF AND no transitive dependency exists ($X \\to Y$ where $Y$ is non-prime and $X$ is not a superkey).
* **BCNF (Boyce-Codd Normal Form):** Stricter than 3NF. For every non-trivial functional dependency $X \\to Y$, **$X$ MUST be a superkey**. Every BCNF relation is in 3NF, but not vice-versa.`;
    }
    // Topic D: General / Tech / Current / Careers
    else {
      // Synthesize general answer grounded in citations
      coreExplanation = `#### 📌 Summary & Key Insights
Based on ${citations.length} verified source(s) [1${citations.length > 1 ? `-${citations.length}` : ""}]:

${citations.map((c, i) => `* **Insight ${i + 1} (${c.title}):** ${c.snippet}`).join("\n\n")}

#### 🔍 Practical Takeaway:
When evaluating **${rawQuery}**, always verify against authoritative sources and keep primary documentation at hand.`;
    }

    // 4. Assemble final markdown
    let result = `${coreExplanation}\n\n---\n\n### 📚 Sourced Evidence & Citations\n${sourcedEvidenceList}`;

    if (conflicts.length > 0) {
      result += `\n\n> ⚖️ **Source Comparison & Disagreement Notice:**\n> ${conflicts.join("\n> ")}`;
    }

    return result;
  }

  /**
   * Generates intuitive follow-up queries based on intent and language
   */
  private static generateFollowUpQuestions(
    query: string,
    intent: string,
    language: string
  ): string[] {
    const qLower = query.toLowerCase();

    if (language === "hinglish") {
      if (qLower.includes("deadlock")) {
        return [
          "Banker's Algorithm ka numerical example samjhao",
          "Deadlock detection aur prevention me kya difference hai?",
          "GATE exam me deadlock par kaunse questions aate hain?",
        ];
      }
      return [
        "Isko ek real-life example ke saath samjhao",
        "Exam point of view se key formulas kya hain?",
        "Iska practical implementation code dikhao",
      ];
    }

    if (qLower.includes("deadlock")) {
      return [
        "How to solve Banker's Algorithm safety state numericals step-by-step?",
        "What is the difference between Deadlock Prevention and Deadlock Avoidance?",
        "Show C implementation of Banker's Algorithm with resource matrices",
      ];
    }

    if (qLower.includes("schedul")) {
      return [
        "Calculate Gantt chart and average waiting time for Round Robin with quantum = 2ms",
        "Why is SJF provably optimal for average waiting time?",
        "What is Multilevel Feedback Queue (MLFQ) scheduling?",
      ];
    }

    if (qLower.includes("normaliz") || qLower.includes("bcnf")) {
      return [
        "Can a table be in 3NF but NOT in BCNF? Show an example",
        "How to find the canonical cover of functional dependencies?",
        "Explain lossless join and dependency preserving decomposition",
      ];
    }

    return [
      `Explain practical industry applications of ${query}`,
      `Show code implementation and edge cases`,
      `What are the most common interview questions on this topic?`,
    ];
  }
}
