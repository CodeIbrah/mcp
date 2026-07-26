import { wrapTool } from "../../core/handler";
import { exaFetch } from "./client";
import { WebFetchSchema } from "../../schemas/exa";
import type { WebFetchInput } from "../../schemas/exa";

export const webFetchTool = wrapTool(
  "exa.web_fetch",
  "Fetch the content of a specific URL using Exa. Returns the page text content.",
  WebFetchSchema,
  async (input: WebFetchInput) => {

    try {
      const content = await exaFetch(input.url);

      const truncated =
        content.length > 30000
          ? content.slice(0, 30000) + "\n\n... [content truncated at 30000 chars]"
          : content;

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ url: input.url, content: truncated }, null, 2),
          },
        ],
      };
    } catch (err) {
      throw err;
    }
  }
);
