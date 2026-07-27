import { describe, it, expect, vi } from "vitest";
import { webSearchTool } from "./search";
import { exaSearch } from "./client";

vi.mock("./client", () => ({
  exaSearch: vi.fn(),
}));

const mockResult = {
  title: "Getting Started with React",
  url: "https://react.dev/learn",
  text: "React is a JavaScript library for building user interfaces. It lets you compose complex UIs from small, isolated pieces of code called components.",
  score: 0.95,
  publishedDate: "2025-01-01",
};

describe("webSearchTool", () => {
  it("returns search results", async () => {
    (exaSearch as ReturnType<typeof vi.fn>).mockResolvedValue([mockResult]);

    const response = await webSearchTool.handler({
      query: "React hooks",
      numResults: 5,
    });

    expect(exaSearch).toHaveBeenCalledWith("React hooks", {
      numResults: 5,
      type: "neural",
      includeText: true,
    });
    expect(response.isError).toBeUndefined();

    const parsed = JSON.parse(response.content[0].text);
    expect(parsed).toStrictEqual({
      query: "React hooks",
      results: [
        {
          title: "Getting Started with React",
          url: "https://react.dev/learn",
          text: "React is a JavaScript library for building user interfaces. It lets you compose complex UIs from small, isolated pieces of code called components.",
          score: 0.95,
          publishedDate: "2025-01-01",
        },
      ],
    });
  });

  it("returns empty results array when no results found", async () => {
    (exaSearch as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const response = await webSearchTool.handler({
      query: "nonexistent topic",
      numResults: 5,
    });

    const parsed = JSON.parse(response.content[0].text);
    expect(parsed.results).toStrictEqual([]);
  });

  it("handles errors from exaSearch", async () => {
    (exaSearch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("API error"));

    const response = await webSearchTool.handler({
      query: "React hooks",
      numResults: 5,
    });

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain("error");
  });

  it("defaults missing result fields", async () => {
    (exaSearch as ReturnType<typeof vi.fn>).mockResolvedValue([
      { url: "https://example.com", score: 0.5 },
    ]);

    const response = await webSearchTool.handler({
      query: "test",
      numResults: 3,
    });

    const parsed = JSON.parse(response.content[0].text);
    expect(parsed.results[0]).toStrictEqual({
      title: "Untitled",
      url: "https://example.com",
      text: null,
      score: 0.5,
      publishedDate: null,
    });
  });

  it("truncates text to 2000 characters", async () => {
    const longText = "x".repeat(3000);
    (exaSearch as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        title: "Long page",
        url: "https://example.com/long",
        text: longText,
        score: 0.8,
        publishedDate: null,
      },
    ]);

    const response = await webSearchTool.handler({
      query: "long content",
      numResults: 1,
    });

    const parsed = JSON.parse(response.content[0].text);
    expect(parsed.results[0].text!.length).toBe(2000);
  });
});
