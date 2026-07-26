import { wrapTool } from "../../core/handler";
import { exaSearch } from "./client";
import { CodeSearchSchema } from "../../schemas/exa";
import type { CodeSearchInput } from "../../schemas/exa";

export const codeSearchTool = wrapTool(
  "exa.code_search",
  "Search for code examples and technical content on the web. Uses Exa to find relevant code snippets.",
  CodeSearchSchema,
  async (input: CodeSearchInput) => {

    try {
      const enhancedQuery = input.language
        ? `${input.query} ${input.language} code example`
        : `${input.query} code example`;

      const results = await exaSearch(enhancedQuery, {
        numResults: input.numResults,
        type: "keyword",
        includeText: true,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                query: enhancedQuery,
                results: results.map((r) => ({
                  title: r.title ?? "Untitled",
                  url: r.url,
                  text: r.text?.slice(0, 3000) ?? null,
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
