import { wrapTool } from "../../core/handler";
import { resolveLibrary } from "./client";
import { DocsSearchSchema } from "../../schemas/context7";
import type { DocsSearchInput } from "../../schemas/context7";

export const docsSearchTool = wrapTool(
  "context7.docs_search",
  "Search for a library on Context7 to find its documentation ID and relevant resources.",
  DocsSearchSchema,
  async (input: DocsSearchInput) => {

    try {
      const results = await resolveLibrary(input.libraryName);

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                message: `No documentation found for "${input.libraryName}"`,
                results: [],
              }, null, 2),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              query: input.query,
              results: results.map((r) => ({
                libraryId: r.libraryId,
                name: r.name,
                description: r.description,
                snippetCount: r.snippetCount,
                reputation: r.reputation ?? "Unknown",
                benchmarkScore: r.benchmarkScore ?? 0,
              })),
            }, null, 2),
          },
        ],
      };
    } catch (err) {
      throw err; // Let the wrapTool handler deal with it
    }
  }
);
