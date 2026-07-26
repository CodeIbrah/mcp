import { wrapTool } from "../../core/handler";
import { queryDocs } from "./client";
import { ApiLookupSchema } from "../../schemas/context7";
import type { ApiLookupInput } from "../../schemas/context7";

export const apiLookupTool = wrapTool(
  "context7.api_lookup",
  "Look up a specific API symbol, function, or class in a library's documentation.",
  ApiLookupSchema,
  async (input: ApiLookupInput) => {

    try {
      const result = await queryDocs(input.libraryId, `API reference: ${input.symbol}`);

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
