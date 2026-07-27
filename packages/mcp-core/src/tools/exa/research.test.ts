import { describe, it, expect, vi } from "vitest";
import { researchBriefTool } from "./research";
import { exaSearch } from "./client";

vi.mock("./client", () => ({
  exaSearch: vi.fn(),
}));

const mockResults = [
  {
    title: "React 19 New Features",
    url: "https://react.dev/blog/2024/12/05/react-19",
    text: "React 19 introduces new features including the React Compiler, Server Components, and Actions.",
    score: 0.96,
    publishedDate: "2024-12-05",
  },
  {
    title: "Getting Started with React",
    url: "https://react.dev/learn",
    text: "React is a JavaScript library for building user interfaces.",
    score: 0.92,
    publishedDate: "2025-01-01",
  },
];

describe("researchBriefTool", () => {
  it("returns a research brief with default depth", async () => {
    (exaSearch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

    const response = await researchBriefTool.handler({
      topic: "React features",
      depth: "standard",
      maxSources: 5,
    });

    expect(exaSearch).toHaveBeenCalledWith("React features", {
      numResults: 5,
      type: "neural",
      includeText: true,
    });
    expect(response.isError).toBeUndefined();

    const brief = JSON.parse(response.content[0].text);
    expect(brief.topic).toBe("React features");
    expect(brief.depth).toBe("standard");
    expect(brief.sourcesFound).toBe(2);
    expect(brief.generatedAt).toBeDefined();
    expect(typeof brief.generatedAt).toBe("string");
    expect(brief.sources).toHaveLength(2);
    expect(brief.sources[0]).toStrictEqual({
      title: "React 19 New Features",
      url: "https://react.dev/blog/2024/12/05/react-19",
      snippet:
        "React 19 introduces new features including the React Compiler, Server Components, and Actions.",
      publishedDate: "2024-12-05",
    });
    expect(brief.summary).toBeDefined();
    expect(brief.summary.length).toBeGreaterThan(0);
  });

  it("returns empty results when no sources found", async () => {
    (exaSearch as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const response = await researchBriefTool.handler({
      topic: "obscure topic",
      depth: "quick",
      maxSources: 3,
    });

    const brief = JSON.parse(response.content[0].text);
    expect(brief.sourcesFound).toBe(0);
    expect(brief.sources).toStrictEqual([]);
    expect(brief.summary).toBe("");
  });

  it("handles errors from exaSearch", async () => {
    (exaSearch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Research failed"));

    const response = await researchBriefTool.handler({
      topic: "React",
      depth: "standard",
      maxSources: 5,
    });

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain("error");
  });

  it("uses larger snippet limit for deep research", async () => {
    const longText = "A. ".repeat(1000);
    (exaSearch as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        title: "Deep Topic",
        url: "https://example.com/deep",
        text: longText,
        score: 0.9,
        publishedDate: null,
      },
    ]);

    const response = await researchBriefTool.handler({
      topic: "deep topic",
      depth: "deep",
      maxSources: 10,
    });

    const brief = JSON.parse(response.content[0].text);
    expect(brief.sources[0].snippet!.length).toBe(3000);
  });

  it("uses smaller snippet limit for quick research", async () => {
    const longText = "Q. ".repeat(600);
    (exaSearch as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        title: "Quick Topic",
        url: "https://example.com/quick",
        text: longText,
        score: 0.9,
        publishedDate: null,
      },
    ]);

    const response = await researchBriefTool.handler({
      topic: "quick topic",
      depth: "quick",
      maxSources: 3,
    });

    const brief = JSON.parse(response.content[0].text);
    expect(brief.sources[0].snippet!.length).toBe(1000);
  });
});
