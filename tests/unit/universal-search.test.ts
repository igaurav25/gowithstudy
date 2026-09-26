import { describe, it, expect, vi } from "vitest";
import { QueryRouter, detectLanguage, normalizeQueryForSearch } from "@/services/search/query-router";
import { UniversalSearchService } from "@/services/search/search-service";
import { DuckDuckGoSearchProvider, WebSearchAggregator } from "@/services/search/providers/web-search-provider";

describe("Phase 1: Universal AI Search Engine & Router", () => {
  describe("Language & Script Detection", () => {
    it("should detect English queries", () => {
      expect(detectLanguage("What is the time complexity of QuickSort?")).toBe("en");
      expect(detectLanguage("Explain Round Robin CPU scheduling")).toBe("en");
    });

    it("should detect Hinglish conversational queries", () => {
      expect(detectLanguage("deadlock kya hota hai samjhao")).toBe("hinglish");
      expect(detectLanguage("isko easy Hinglish me samjhao please")).toBe("hinglish");
      expect(detectLanguage("kaise solve karein isko?")).toBe("hinglish");
    });

    it("should detect Hindi in Devanagari script", () => {
      expect(detectLanguage("ऑपरेटिंग सिस्टम में डेडलॉक क्या होता है?")).toBe("hi");
    });

    it("should detect Spanish queries", () => {
      expect(detectLanguage("que es la memoria virtual y como funciona?")).toBe("es");
    });
  });

  describe("Query Normalization & Conversational History", () => {
    it("should strip polite conversational prefixes", () => {
      const normalized = normalizeQueryForSearch("Can you please explain Dijkstra's algorithm?");
      expect(normalized).toBe("Dijkstra's algorithm?");
    });

    it("should resolve follow-up context when referencing previous turn", () => {
      const history = [
        { role: "user", content: "What is Banker's Algorithm?" },
        { role: "assistant", content: "Banker's Algorithm is a deadlock avoidance algorithm." },
      ];
      const normalized = normalizeQueryForSearch("explain it simply", history);
      expect(normalized.toLowerCase()).toContain("banker's algorithm");
    });
  });

  describe("QueryRouter Routing Decision", () => {
    it("should route core academic concepts to Document RAG", () => {
      const decision = QueryRouter.analyze("Explain BCNF and 3NF normalization in DBMS");
      expect(decision.intent).toBe("ACADEMIC_CONCEPT");
      expect(decision.needsDocumentRag).toBe(true);
      expect(decision.sources).toContain("DOCUMENT_RAG");
    });

    it("should route current events & latest tech queries to Live Web Search", () => {
      const decision = QueryRouter.analyze("What are the latest 2026 tech trends and Next.js features?");
      expect(decision.intent).toBe("CURRENT_EVENT");
      expect(decision.needsWebSearch).toBe(true);
      expect(decision.sources).toContain("LIVE_WEB");
    });

    it("should route career and company questions to Live Web Search", () => {
      const decision = QueryRouter.analyze("Google software engineer L4 interview questions and salary roadmap");
      expect(decision.intent).toBe("CAREER_TECH");
      expect(decision.needsWebSearch).toBe(true);
      expect(decision.sources).toContain("LIVE_WEB");
    });

    it("should route campus notices and student notes to CampusFlow DB", () => {
      const decision = QueryRouter.analyze("Check my notes and assignments for Operating Systems");
      expect(decision.intent).toBe("CAMPUSFLOW_INTERNAL");
      expect(decision.needsCampusDb).toBe(true);
      expect(decision.sources).toContain("CAMPUSFLOW_DB");
    });
  });

  describe("UniversalSearchService Execution", () => {
    it("should execute academic question and attach document citations", async () => {
      const response = await UniversalSearchService.search("Explain CPU scheduling Round Robin and SJF");
      expect(response.id).toBeDefined();
      expect(response.citations.length).toBeGreaterThan(0);
      expect(response.answerMarkdown).toContain("CPU Scheduling");
      expect(response.suggestedFollowUps.length).toBeGreaterThan(0);
      expect(response.sourcesChosen).toContain("AI_REASONING");
    });

    it("should handle Hinglish queries and produce Hinglish explanation", async () => {
      const response = await UniversalSearchService.search("deadlock kya hota hai samjhao");
      expect(response.detectedLanguage).toBe("hinglish");
      expect(response.answerMarkdown.toLowerCase()).toContain("deadlock");
      expect(response.citations.length).toBeGreaterThan(0);
    });

    it("should handle completely unverified or nonsensical queries without fabricating facts", async () => {
      const searchSpy = vi.spyOn(WebSearchAggregator, "search").mockResolvedValueOnce([]);
      const response = await UniversalSearchService.search("zxkjq97184209182370912");
      expect(response.isUncertain).toBe(true);
      expect(response.answerMarkdown).toMatch(/No Verified Sources Found|nahi mile/i);
      searchSpy.mockRestore();
    });
  });

  describe("DuckDuckGo Provider Parser", () => {
    it("should parse and extract clean URLs from DDG HTML", () => {
      const provider = new DuckDuckGoSearchProvider();
      const sampleHtml = `
        <div class="result results_links results_links_deep web-result">
          <a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Freact.dev%2Flearn">React Documentation</a>
          <div class="result__snippet">The library for web and native user interfaces.</div>
        </div>
      `;
      // @ts-expect-error accessing private method for unit testing
      const parsed = provider.parseHtmlResults(sampleHtml, 5);
      expect(parsed.length).toBe(1);
      expect(parsed[0].title).toBe("React Documentation");
      expect(parsed[0].url).toBe("https://react.dev/learn");
      expect(parsed[0].domain).toBe("react.dev");
      expect(parsed[0].isOfficialOrAcademic).toBe(true);
    });
  });
});
