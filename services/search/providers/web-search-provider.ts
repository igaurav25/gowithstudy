import { WebSearchResult } from "@/services/search/types";

export interface WebSearchProvider {
  name: string;
  search(query: string, maxResults?: number): Promise<WebSearchResult[]>;
}

// Authoritative domain patterns (official documentation, government, university, research)
const AUTHORITATIVE_DOMAINS = [
  "edu",
  "gov",
  "ac.in",
  "org",
  "github.com",
  "developer.mozilla.org",
  "w3.org",
  "ietf.org",
  "arxiv.org",
  "wikipedia.org",
  "ieee.org",
  "acm.org",
  "nature.com",
  "nih.gov",
  "isro.gov.in",
  "nasa.gov",
  "docs.python.org",
  "react.dev",
  "nextjs.org",
  "typescriptlang.org",
  "nodejs.org",
  "oracle.com",
  "microsoft.com",
  "google.com",
];

function isAuthoritative(url: string, domain: string): boolean {
  const lowerDomain = domain.toLowerCase();
  const lowerUrl = url.toLowerCase();
  return (
    AUTHORITATIVE_DOMAINS.some(
      (auth) => lowerDomain === auth || lowerDomain.endsWith(`.${auth}`)
    ) ||
    lowerUrl.includes("/docs/") ||
    lowerUrl.includes("/documentation/") ||
    lowerUrl.includes(".edu/") ||
    lowerUrl.includes(".gov/")
  );
}

function cleanDuckDuckGoUrl(rawUrl: string): string {
  try {
    if (rawUrl.includes("uddg=")) {
      const match = rawUrl.match(/uddg=([^&]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }
    if (rawUrl.startsWith("//")) {
      return `https:${rawUrl}`;
    }
    return rawUrl;
  } catch {
    return rawUrl;
  }
}

function extractDomain(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "web";
  }
}

/**
 * Real HTTP DuckDuckGo Web Search Provider
 * Executes live web queries against DuckDuckGo without requiring paid API keys.
 */
export class DuckDuckGoSearchProvider implements WebSearchProvider {
  name = "DuckDuckGo Live Search";

  async search(query: string, maxResults = 5): Promise<WebSearchResult[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      // DuckDuckGo HTML endpoint
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

      const response = await fetch(searchUrl, {
        method: "POST",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        body: `q=${encodeURIComponent(query)}&b=`,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Fall back to Instant Answer API if HTML endpoint is throttled
        return await this.searchInstantAnswerApi(query, maxResults);
      }

      const html = await response.text();
      const parsedResults = this.parseHtmlResults(html, maxResults, query);

      if (parsedResults.length > 0) {
        return parsedResults;
      }

      // If HTML was empty or blocked, check Instant Answer API
      return await this.searchInstantAnswerApi(query, maxResults);
    } catch {
      // In case of timeout or network disconnect, check Instant Answer API as backup
      try {
        return await this.searchInstantAnswerApi(query, maxResults);
      } catch {
        return [];
      }
    }
  }

  private parseHtmlResults(html: string, maxResults: number, query?: string): WebSearchResult[] {
    const results: WebSearchResult[] = [];
    const seenUrls = new Set<string>();
    const queryTerms = query
      ? query
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, " ")
          .split(/\s+/)
          .filter((w) => w.length >= 3)
      : [];

    // Regex match for DDG result containers: class="result results_links results_links_deep web-result"
    // Extract: href="..." title / text and snippet class="result__snippet"
    const resultBlocks = html.split(/<div[^>]*class="[^"]*result\s+results_links[^"]*"[^>]*>/gi);

    for (let i = 1; i < resultBlocks.length && results.length < maxResults; i++) {
      const block = resultBlocks[i];

      // Extract URL
      const urlMatch = block.match(/<a[^>]*class="result__url"[^>]*href="([^"]+)"/i) ||
        block.match(/<a[^>]*class="result__a"[^>]*href="([^"]+)"/i);
      if (!urlMatch) continue;

      const rawUrl = urlMatch[1];
      const cleanUrl = cleanDuckDuckGoUrl(rawUrl);

      if (!cleanUrl || cleanUrl.includes("duckduckgo.com") || seenUrls.has(cleanUrl)) {
        continue;
      }
      seenUrls.add(cleanUrl);

      // Extract Title
      const titleMatch = block.match(/<a[^>]*class="result__a"[^>]*>([\s\S]*?)<\/a>/i);
      const title = titleMatch
        ? titleMatch[1].replace(/<[^>]+>/g, "").trim()
        : "Web Result";

      // Extract Snippet
      const snippetMatch = block.match(/<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i) ||
        block.match(/<div[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/div>/i);
      const snippet = snippetMatch
        ? snippetMatch[1].replace(/<[^>]+>/g, "").trim()
        : "";

      if (!snippet && title.length < 5) continue;

      // Relevance check: ensure result has at least one matching query term
      if (queryTerms.length > 0) {
        const textCombined = `${title} ${snippet}`.toLowerCase();
        const matchesQuery = queryTerms.some((t) => textCombined.includes(t));
        if (!matchesQuery) continue;
      }

      const domain = extractDomain(cleanUrl);
      const authoritative = isAuthoritative(cleanUrl, domain);

      results.push({
        title,
        url: cleanUrl,
        domain,
        snippet,
        relevanceScore: authoritative ? 0.95 : 0.82,
        isOfficialOrAcademic: authoritative,
      });
    }

    return results;
  }

  private async searchInstantAnswerApi(query: string, maxResults: number): Promise<WebSearchResult[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=0`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) return [];
      const data = await res.json();
      const list: WebSearchResult[] = [];
      const queryTerms = query
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 3);

      if (data.AbstractText && data.AbstractURL) {
        const textCombined = `${data.Heading || ""} ${data.AbstractText}`.toLowerCase();
        const matchesQuery = queryTerms.length === 0 || queryTerms.some((t) => textCombined.includes(t));
        if (matchesQuery) {
          const domain = extractDomain(data.AbstractURL);
          list.push({
            title: data.Heading || query,
            url: data.AbstractURL,
            domain,
            snippet: data.AbstractText,
            relevanceScore: 0.96,
            isOfficialOrAcademic: isAuthoritative(data.AbstractURL, domain),
          });
        }
      }

      if (Array.isArray(data.RelatedTopics)) {
        for (const item of data.RelatedTopics) {
          if (list.length >= maxResults) break;
          if (item.Text && item.FirstURL) {
            const matchesQuery = queryTerms.length === 0 || queryTerms.some((t) => item.Text.toLowerCase().includes(t));
            if (!matchesQuery) continue;

            const domain = extractDomain(item.FirstURL);
            list.push({
              title: item.Text.slice(0, 70),
              url: item.FirstURL,
              domain,
              snippet: item.Text,
              relevanceScore: 0.85,
              isOfficialOrAcademic: isAuthoritative(item.FirstURL, domain),
            });
          }
        }
      }

      return list;
    } catch {
      return [];
    }
  }
}

/**
 * Tavily AI Search Provider (Used when TAVILY_API_KEY is configured)
 */
export class TavilySearchProvider implements WebSearchProvider {
  name = "Tavily AI Search";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(query: string, maxResults = 5): Promise<WebSearchResult[]> {
    try {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: this.apiKey,
          query,
          search_depth: "advanced",
          include_answer: false,
          max_results: maxResults,
        }),
      });

      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data.results)) return [];

      return data.results.map((r: { title: string; url: string; content: string; published_date?: string }) => {
        const domain = extractDomain(r.url);
        return {
          title: r.title,
          url: r.url,
          domain,
          snippet: r.content,
          publishedDate: r.published_date,
          relevanceScore: 0.94,
          isOfficialOrAcademic: isAuthoritative(r.url, domain),
        };
      });
    } catch {
      return [];
    }
  }
}

/**
 * Serper (Google Search API) Provider (Used when SERPER_API_KEY is configured)
 */
export class SerperSearchProvider implements WebSearchProvider {
  name = "Serper Google Search";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(query: string, maxResults = 5): Promise<WebSearchResult[]> {
    try {
      const res = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: query, num: maxResults }),
      });

      if (!res.ok) return [];
      const data = await res.json();
      const organic = data.organic || [];

      return organic.slice(0, maxResults).map((r: { title: string; link: string; snippet: string; date?: string }) => {
        const domain = extractDomain(r.link);
        return {
          title: r.title,
          url: r.link,
          domain,
          snippet: r.snippet,
          publishedDate: r.date,
          relevanceScore: 0.95,
          isOfficialOrAcademic: isAuthoritative(r.link, domain),
        };
      });
    } catch {
      return [];
    }
  }
}

/**
 * Aggregator that picks the best configured provider with automatic fallback
 */
export class WebSearchAggregator {
  static getProvider(): WebSearchProvider {
    if (process.env.TAVILY_API_KEY) {
      return new TavilySearchProvider(process.env.TAVILY_API_KEY);
    }
    if (process.env.SERPER_API_KEY) {
      return new SerperSearchProvider(process.env.SERPER_API_KEY);
    }
    return new DuckDuckGoSearchProvider();
  }

  static async search(query: string, maxResults = 5): Promise<WebSearchResult[]> {
    const primaryProvider = this.getProvider();
    const results = await primaryProvider.search(query, maxResults);

    if (results.length > 0) {
      return results;
    }

    // If primary provider was an API key that failed/rate-limited, fall back to DuckDuckGo
    if (primaryProvider.name !== "DuckDuckGo Live Search") {
      const ddg = new DuckDuckGoSearchProvider();
      return await ddg.search(query, maxResults);
    }

    return [];
  }
}
