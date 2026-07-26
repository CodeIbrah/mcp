import { wrapTool } from "../../core/handler";
import { queryDocs } from "./client";
import { DocsGetSchema } from "../../schemas/context7";
import type { DocsGetInput } from "../../schemas/context7";

export const docsGetTool = wrapTool(
  "context7.docs_get",
  "Query documentation content for a specific library and topic. Returns relevant docs and examples.",
  DocsGetSchema,
  async (input: DocsGetInput) => {

    try {
      const result = await queryDocs(input.libraryId, input.query);

      return {
        content: [
          {
            type: "text" as const,
            text: result,
          },
        ],
      };
    } catch (err) {
      throw err;
    }
  }
);
