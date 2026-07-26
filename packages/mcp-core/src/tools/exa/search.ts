import { wrapTool } from "../../core/handler";
import { exaSearch } from "./client";
import { WebSearchSchema } from "../../schemas/exa";
import type { WebSearchInput } from "../../schemas/exa";

export const webSearchTool = wrapTool(
  "exa.web_search",
  "Search the web using Exa's neural search engine. Returns relevant results with snippets.",
  WebSearchSchema,
  async (input: WebSearchInput) => {

    try {
      const results = await exaSearch(input.query, {
        numResults: input.numResults,
        type: "neural",
        includeText: true,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                query: input.query,
                results: results.map((r) => ({
                  title: r.title ?? "Untitled",
                  url: r.url,
                  text: r.text?.slice(0, 2000) ?? null,
                  score: r.score,
                  publishedDate: r.publishedDate ?? null,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (err) {
      throw err;
    }
  }
);
