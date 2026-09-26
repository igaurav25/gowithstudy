export type QueryIntent =
  | "ACADEMIC_CONCEPT"
  | "PROGRAMMING_CODE"
  | "CURRENT_EVENT"
  | "CAREER_TECH"
  | "CAMPUSFLOW_INTERNAL"
  | "GENERAL_KNOWLEDGE"
  | "COMPARISON_ANALYSIS"
  | "MULTILINGUAL_QUERY";

export type DataSourceType =
  | "CAMPUSFLOW_DB"
  | "DOCUMENT_RAG"
  | "LIVE_WEB"
  | "AI_REASONING";

export interface UnifiedCitation {
  id: string;
  sourceType: DataSourceType;
  title: string;
  url?: string;
  domain?: string;
  pageNumber?: number;
  snippet: string;
  retrievalTime: string;
  confidenceScore: number;
  isPrimaryAuthoritative?: boolean;
}

export interface WebSearchResult {
  title: string;
  url: string;
  domain: string;
  snippet: string;
  publishedDate?: string;
  relevanceScore: number;
  isOfficialOrAcademic?: boolean;
}

export interface InternalDbEvidence {
  entityType: "NOTE" | "ASSIGNMENT" | "TIMETABLE" | "INTERNSHIP" | "PROJECT" | "COLLEGE_INFO" | "COMMUNITY";
  title: string;
  snippet: string;
  referenceId: string;
  url: string;
}

export interface RoutingDecision {
  query: string;
  normalizedQuery: string;
  intent: QueryIntent;
  detectedLanguage: string; // "en" | "hi" | "hinglish" | "es" | "other"
  needsWebSearch: boolean;
  needsDocumentRag: boolean;
  needsCampusDb: boolean;
  sources: DataSourceType[];
  reasoningSummary: string;
}

export interface UniversalSearchResponse {
  id: string;
  query: string;
  intent: QueryIntent;
  detectedLanguage: string;
  sourcesChosen: DataSourceType[];
  answerMarkdown: string;
  citations: UnifiedCitation[];
  webResults: WebSearchResult[];
  conflictsDetected?: string[];
  isUncertain?: boolean;
  searchPerformed: boolean;
  suggestedFollowUps: string[];
  timestamp: string;
}
