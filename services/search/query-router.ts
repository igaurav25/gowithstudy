import { QueryIntent, RoutingDecision, DataSourceType } from "@/services/search/types";

/**
 * Common Hinglish and Hindi words used by students
 */
const HINGLISH_PATTERNS = [
  /\bkya\b/i,
  /\bkaise\b/i,
  /\bkyu\b/i,
  /\bkyun\b/i,
  /\bsamjhao\b/i,
  /\bbatao\b/i,
  /\bmujhe\b/i,
  /\bmera\b/i,
  /\bmeri\b/i,
  /\bhota\b/i,
  /\bhoti\b/i,
  /\bhote\b/i,
  /\bhain\b/i,
  /\bhai\b/i,
  /\bme\b/i,
  /\bmein\b/i,
  /\bke\b/i,
  /\bki\b/i,
  /\bka\b/i,
  /\bko\b/i,
  /\bkaro\b/i,
  /\bpadhna\b/i,
  /\bsamajh\b/i,
  /\bbolo\b/i,
  /\bchahiye\b/i,
];

// Devanagari character set range
const DEVANAGARI_REGEX = /[\u0900-\u097F]/;

/**
 * Detect language of student query
 */
export function detectLanguage(text: string): "en" | "hi" | "hinglish" | "es" | "other" {
  if (DEVANAGARI_REGEX.test(text)) {
    return "hi";
  }

  let hinglishScore = 0;
  for (const pattern of HINGLISH_PATTERNS) {
    if (pattern.test(text)) hinglishScore++;
  }

  if (hinglishScore >= 2 || (hinglishScore >= 1 && text.split(/\s+/).length <= 5)) {
    return "hinglish";
  }

  const lower = text.toLowerCase();
  if (/\b(que es|como|por que|explicame|gracias|buenos dias)\b/i.test(lower)) {
    return "es";
  }

  return "en";
}

/**
 * Extract clean search keywords from conversational or follow-up queries
 */
export function normalizeQueryForSearch(
  query: string,
  history?: { role: string; content: string }[]
): string {
  let clean = query.trim();

  // If follow-up reference like "what about the other one?", "explain it simply", use context
  if (history && history.length > 0 && clean.split(/\s+/).length <= 4) {
    const isFollowUpRef = /\b(it|this|that|other|second|previous|what about|how about|explain more)\b/i.test(clean);
    if (isFollowUpRef) {
      // Find the last assistant or user query topic
      for (let i = history.length - 1; i >= 0; i--) {
        const msg = history[i];
        if (msg.role === "user" && msg.content !== query) {
          clean = `${msg.content} ${clean}`;
          break;
        }
      }
    }
  }

  // Remove polite and conversational prefixes
  clean = clean.replace(
    /^(can you please\s+(explain|tell me\s+about\s+)?|please\s+(explain|tell me\s+about\s+)?|tell me\s+(about\s+)?|explain to me\s+|explain\s+|i want to know about\s+|could you explain\s+)/i,
    ""
  );
  return clean.trim();
}

export class QueryRouter {
  /**
   * Evaluates query to select appropriate data sources & execution route
   */
  static analyze(
    query: string,
    options?: {
      targetNoteId?: string;
      history?: { role: string; content: string }[];
    }
  ): RoutingDecision {
    const rawQuery = query.trim();
    const normalizedQuery = normalizeQueryForSearch(rawQuery, options?.history);
    const qLower = normalizedQuery.toLowerCase();
    const detectedLanguage = detectLanguage(rawQuery);

    let intent: QueryIntent = "GENERAL_KNOWLEDGE";
    let needsWebSearch = false;
    let needsDocumentRag = false;
    let needsCampusDb = false;
    const reasoning: string[] = [];

    // 1. Check for CampusFlow Internal Data intent
    const internalKeywords = [
      "my note",
      "my assignment",
      "my timetable",
      "my class",
      "my schedule",
      "my project",
      "my internship",
      "university notice",
      "college announcement",
      "campus notice",
      "attendance",
    ];

    if (internalKeywords.some((k) => qLower.includes(k))) {
      intent = "CAMPUSFLOW_INTERNAL";
      needsCampusDb = true;
      needsDocumentRag = true;
      reasoning.push("Query requests personal student data or campus information.");
    }

    // 2. Check for Time-Sensitive / Current Events intent
    const currentEventKeywords = [
      "latest",
      "current",
      "recent",
      "news",
      "today",
      "yesterday",
      "2024",
      "2025",
      "2026",
      "released",
      "new version",
      "upcoming",
      "election",
      "who is currently",
      "ceo of",
      "price of",
      "stock",
    ];

    if (currentEventKeywords.some((k) => qLower.includes(k))) {
      intent = "CURRENT_EVENT";
      needsWebSearch = true;
      reasoning.push("Query involves real-time, recent, or time-sensitive factual information.");
    }

    // 3. Check for Career, Companies, Tech Ecosystem
    const careerTechKeywords = [
      "salary",
      "faang",
      "interview questions",
      "job",
      "hiring",
      "internship at google",
      "internship at microsoft",
      "top companies",
      "resume",
      "roadmap for",
      "framework comparison",
      "market demand",
    ];

    if (careerTechKeywords.some((k) => qLower.includes(k))) {
      intent = "CAREER_TECH";
      needsWebSearch = true;
      reasoning.push("Query asks about industry careers, companies, or tech market standards.");
    }

    // 4. Check for Comparison / Analysis
    if (
      qLower.includes("difference between") ||
      qLower.includes("vs") ||
      qLower.includes("versus") ||
      qLower.includes("compare") ||
      qLower.includes("pros and cons")
    ) {
      intent = "COMPARISON_ANALYSIS";
      needsDocumentRag = true;
      needsWebSearch = true;
      reasoning.push("Comparative query benefits from both course notes and web evidence.");
    }

    // 5. Check for Programming / Code Implementation
    const codeKeywords = [
      "code",
      "implement",
      "algorithm",
      "function",
      "syntax",
      "typescript",
      "javascript",
      "python",
      "c++",
      "java",
      "react",
      "nextjs",
      "bug",
      "error",
      "api route",
    ];

    if (codeKeywords.some((k) => qLower.includes(k))) {
      if (intent === "GENERAL_KNOWLEDGE") intent = "PROGRAMMING_CODE";
      needsDocumentRag = true;
      needsWebSearch = true;
      reasoning.push("Coding/algorithm query matches course materials and web developer references.");
    }

    // 6. Check for Core Academic Concepts (OS, DBMS, CN, DSA, Math)
    const academicKeywords = [
      "scheduling",
      "deadlock",
      "semaphore",
      "mutex",
      "paging",
      "virtual memory",
      "bcnf",
      "normalization",
      "sql",
      "transaction",
      "acid",
      "tcp",
      "udp",
      "osi layer",
      "ip address",
      "knapsack",
      "dijkstra",
      "binary search",
      "dynamic programming",
      "complexity",
      "eigenvalue",
      "graph theory",
      "turing machine",
      "compiler",
      "syllabus",
    ];

    if (academicKeywords.some((k) => qLower.includes(k)) || options?.targetNoteId) {
      intent = "ACADEMIC_CONCEPT";
      needsDocumentRag = true;
      reasoning.push("Query matches standard B.Tech Computer Science curriculum.");
    }

    // If query was typed in Hindi/Hinglish, flag intent appropriately
    if (detectedLanguage === "hinglish" || detectedLanguage === "hi") {
      if (intent === "GENERAL_KNOWLEDGE") {
        intent = "MULTILINGUAL_QUERY";
      }
      reasoning.push(`Detected student query in ${detectedLanguage.toUpperCase()}.`);
    }

    // Default fallbacks:
    // If not specifically internal or academic, trigger web search for general world knowledge
    if (!needsDocumentRag && !needsCampusDb) {
      needsWebSearch = true;
    }

    // Assemble source list
    const sources: DataSourceType[] = [];
    if (needsCampusDb) sources.push("CAMPUSFLOW_DB");
    if (needsDocumentRag) sources.push("DOCUMENT_RAG");
    if (needsWebSearch) sources.push("LIVE_WEB");
    sources.push("AI_REASONING");

    return {
      query: rawQuery,
      normalizedQuery,
      intent,
      detectedLanguage,
      needsWebSearch,
      needsDocumentRag,
      needsCampusDb,
      sources,
      reasoningSummary: reasoning.join(" "),
    };
  }
}
