import { wrapTool } from "../../core/handler";
import { exaSearch } from "./client";
import { ResearchBriefSchema } from "../../schemas/exa";
import type { ResearchBriefInput } from "../../schemas/exa";

export const researchBriefTool = wrapTool(
  "exa.research_brief",
  "Generate a research brief on a topic by searching the web and synthesizing top results.",
  ResearchBriefSchema,
  async (input: ResearchBriefInput) => {

    try {
      const depthMultiplier = input.depth === "quick" ? 5 : input.depth === "deep" ? 15 : 10;

      const results = await exaSearch(input.topic, {
        numResults: input.maxSources,
        type: "neural",
        includeText: true,
      });

      const brief = {
        topic: input.topic,
        depth: input.depth,
        sourcesFound: results.length,
        generatedAt: new Date().toISOString(),
        sources: results.map((r) => ({
          title: r.title ?? "Untitled",
          url: r.url,
          snippet: r.text?.slice(0, depthMultiplier * 200) ?? null,
          publishedDate: r.publishedDate ?? null,
        })),
        summary: results
          .slice(0, 3)
          .map((r) => r.text?.slice(0, 500))
          .filter(Boolean)
          .join("\n\n"),
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(brief, null, 2),
          },
        ],
      };
    } catch (err) {
      throw err;
    }
  }
);
