import { wrapTool } from "../../core/handler";
import { queryDocs } from "./client";
import { ExamplesGetSchema } from "../../schemas/context7";
import type { ExamplesGetInput } from "../../schemas/context7";

export const examplesGetTool = wrapTool(
  "context7.examples_get",
  "Get code examples for a specific library and use case.",
  ExamplesGetSchema,
  async (input: ExamplesGetInput) => {

    try {
      const result = await queryDocs(input.libraryId, `code examples: ${input.query}`);

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
