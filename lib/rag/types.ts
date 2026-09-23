export type AIStudyMode = "EXPLAIN" | "QUIZ" | "SUMMARY" | "CODE";

export interface DocumentChunk {
  id: string;
  noteId: string;
  noteTitle: string;
  subject: string;
  pageNumber: number;
  content: string;
  keywords: string[];
  embeddingVector?: number[];
}

export interface Citation {
  documentId: string;
  documentTitle: string;
  pageNumber: number;
  snippet: string;
  similarityScore: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  citation?: Citation;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode: AIStudyMode;
  citations: Citation[];
  quizQuestions?: QuizQuestion[];
  isOutOfScope?: boolean;
  timestamp: Date | string;
}

export interface RetrievalResult {
  chunks: DocumentChunk[];
  citations: Citation[];
  isGroundedInDocument: boolean;
}
