import { DocumentChunk, Citation, RetrievalResult } from "@/lib/rag/types";
import { CORE_CSE_SEMANTIC_CHUNKS } from "@/lib/rag/chunker";

/**
 * Stopwords to ignore in basic token overlap
 */
const STOP_WORDS = new Set([
  "the", "is", "at", "which", "on", "and", "a", "an", "in", "to", "for", "of",
  "or", "by", "with", "from", "as", "can", "you", "tell", "me", "what", "how",
  "why", "explain", "describe", "give", "example", "please", "my", "notes",
  "about", "does", "do", "we", "are", "it", "this", "that", "these", "those"
]);

/**
 * Tokenize a text string into normalized terms
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * Score relevance between a user query and a document chunk
 */
function scoreChunk(queryTerms: string[], fullQueryLower: string, chunk: DocumentChunk): number {
  let score = 0;
  const chunkContentLower = chunk.content.toLowerCase();
  const chunkTitleLower = chunk.noteTitle.toLowerCase();
  const chunkSubjectLower = chunk.subject.toLowerCase();

  // 1. Exact phrase match bonus
  if (fullQueryLower.length > 5 && chunkContentLower.includes(fullQueryLower)) {
    score += 4.0;
  }

  // 2. Title & Subject relevance
  for (const term of queryTerms) {
    if (chunkTitleLower.includes(term)) score += 1.5;
    if (chunkSubjectLower.includes(term)) score += 1.2;
    if (chunk.keywords.some((k) => k.toLowerCase().includes(term))) score += 1.0;
  }

  // 3. Term frequency in content
  for (const term of queryTerms) {
    const occurrences = (chunkContentLower.match(new RegExp(`\\b${term}\\b`, "g")) || []).length;
    if (occurrences > 0) {
      score += Math.min(2.5, 0.5 + occurrences * 0.3);
    }
  }

  // Normalize score between 0 and 1
  const maxPossible = Math.max(1, queryTerms.length * 2.5);
  const normalized = Math.min(0.99, Math.max(0.1, score / maxPossible));
  return parseFloat(normalized.toFixed(2));
}

/**
 * Extracts a concise 120-character snippet around the best matched query terms
 */
function extractSnippet(content: string, queryTerms: string[]): string {
  const contentLower = content.toLowerCase();
  let bestIndex = -1;

  for (const term of queryTerms) {
    const idx = contentLower.indexOf(term);
    if (idx !== -1) {
      bestIndex = idx;
      break;
    }
  }

  if (bestIndex === -1) {
    return content.slice(0, 140).trim() + "...";
  }

  const start = Math.max(0, bestIndex - 40);
  const end = Math.min(content.length, bestIndex + 100);
  let snippet = content.slice(start, end).trim();

  if (start > 0) snippet = "..." + snippet;
  if (end < content.length) snippet = snippet + "...";
  return snippet;
}

export class SemanticRetriever {
  /**
   * Search and retrieve top-K relevant chunks across active document pool
   */
  static retrieve(
    query: string,
    targetNoteId: string = "ALL",
    topK = 3,
    customChunks: DocumentChunk[] = []
  ): RetrievalResult {
    const pool = [...CORE_CSE_SEMANTIC_CHUNKS, ...customChunks];

    // Filter by note ID if specific document requested
    const candidates =
      targetNoteId && targetNoteId !== "ALL" && targetNoteId !== "GENERAL"
        ? pool.filter((c) => c.noteId === targetNoteId)
        : pool;

    if (candidates.length === 0) {
      return {
        chunks: [],
        citations: [],
        isGroundedInDocument: false,
      };
    }

    const queryTerms = tokenize(query);
    const fullQueryLower = query.toLowerCase().trim();

    const scored = candidates.map((chunk) => ({
      chunk,
      score: scoreChunk(queryTerms, fullQueryLower, chunk),
    }));

    // Sort descending by relevance score
    scored.sort((a, b) => b.score - a.score);

    const bestMatches = scored.slice(0, topK);
    const topScore = bestMatches[0]?.score || 0;

    // Threshold for considering query grounded
    const isGrounded = topScore >= 0.28;

    const chunks = bestMatches.map((m) => m.chunk);
    const citations: Citation[] = bestMatches.map((m) => ({
      documentId: m.chunk.noteId,
      documentTitle: m.chunk.noteTitle,
      pageNumber: m.chunk.pageNumber,
      snippet: extractSnippet(m.chunk.content, queryTerms),
      similarityScore: m.score,
    }));

    return {
      chunks,
      citations: isGrounded ? citations : [],
      isGroundedInDocument: isGrounded,
    };
  }
}
