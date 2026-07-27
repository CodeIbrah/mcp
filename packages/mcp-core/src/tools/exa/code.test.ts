import { describe, it, expect, vi } from "vitest";
import { codeSearchTool } from "./code";
import { exaSearch } from "./client";

vi.mock("./client", () => ({
  exaSearch: vi.fn(),
}));

const mockResult = {
  title: "useState example",
  url: "https://github.com/facebook/react/blob/main/packages/react/src/useState.js",
  text: "function useState(initialState) { var dispatcher = resolveDispatcher(); return dispatcher.useState(initialState); }",
  score: 0.85,
  publishedDate: "2024-06-01",
};

describe("codeSearchTool", () => {
  it("returns code search results with language filter", async () => {
    (exaSearch as ReturnType<typeof vi.fn>).mockResolvedValue([mockResult]);

    const response = await codeSearchTool.handler({
      query: "useState",
      language: "JavaScript",
      numResults: 5,
    });

    expect(exaSearch).toHaveBeenCalledWith("useState JavaScript code example", {
      numResults: 5,
      type: "keyword",
      includeText: true,
    });
    expect(response.isError).toBeUndefined();

    const parsed = JSON.parse(response.content[0].text);
    expect(parsed.query).toBe("useState JavaScript code example");
    expect(parsed.results[0]).toStrictEqual({
      title: "useState example",
      url: "https://github.com/facebook/react/blob/main/packages/react/src/useState.js",
      text: "function useState(initialState) { var dispatcher = resolveDispatcher(); return dispatcher.useState(initialState); }",
      publishedDate: "2024-06-01",
    });
  });

  it("returns code search results without language filter", async () => {
    (exaSearch as ReturnType<typeof vi.fn>).mockResolvedValue([mockResult]);

    const response = await codeSearchTool.handler({
      query: "useState",
      numResults: 3,
    });

    expect(exaSearch).toHaveBeenCalledWith("useState code example", {
      numResults: 3,
      type: "keyword",
      includeText: true,
    });
    expect(response.isError).toBeUndefined();
  });

  it("returns empty results when no code found", async () => {
    (exaSearch as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const response = await codeSearchTool.handler({
      query: "xyz_nonexistent_function",
      numResults: 5,
    });

    const parsed = JSON.parse(response.content[0].text);
    expect(parsed.results).toStrictEqual([]);
  });

  it("handles errors from exaSearch", async () => {
    (exaSearch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Search failed"));

    const response = await codeSearchTool.handler({
      query: "useState",
      numResults: 5,
    });

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain("error");
  });

  it("truncates text to 3000 characters", async () => {
    const longText = "x".repeat(4000);
    (exaSearch as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        title: "Long code",
        url: "https://example.com/long",
        text: longText,
        score: 0.7,
        publishedDate: null,
      },
    ]);

    const response = await codeSearchTool.handler({
      query: "long code",
      numResults: 1,
    });

    const parsed = JSON.parse(response.content[0].text);
    expect(parsed.results[0].text!.length).toBe(3000);
  });
});
