import { describe, it, expect, vi } from "vitest";
import { docsSearchTool } from "./search";
import { resolveLibrary } from "./client";

vi.mock("./client", () => ({
  resolveLibrary: vi.fn(),
}));

const mockResult = {
  libraryId: "/react/react",
  name: "React",
  description: "React library documentation",
  snippetCount: 42,
  reputation: "High" as const,
  benchmarkScore: 95,
};

describe("docsSearchTool", () => {
  it("returns results when library is found", async () => {
    (resolveLibrary as ReturnType<typeof vi.fn>).mockResolvedValue([mockResult]);

    const response = await docsSearchTool.handler({
      libraryName: "react",
      query: "hooks",
    });

    expect(resolveLibrary).toHaveBeenCalledWith("react");
    expect(response.isError).toBeUndefined();

    const parsed = JSON.parse(response.content[0].text);
    expect(parsed).toStrictEqual({
      query: "hooks",
      results: [
        {
          libraryId: "/react/react",
          name: "React",
          description: "React library documentation",
          snippetCount: 42,
          reputation: "High",
          benchmarkScore: 95,
        },
      ],
    });
  });

  it("returns empty message when no library found", async () => {
    (resolveLibrary as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const response = await docsSearchTool.handler({
      libraryName: "nonexistent",
      query: "hooks",
    });

    const parsed = JSON.parse(response.content[0].text);
    expect(parsed).toStrictEqual({
      message: 'No documentation found for "nonexistent"',
      results: [],
    });
  });

  it("handles errors from resolveLibrary", async () => {
    (resolveLibrary as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("API error"));

    const response = await docsSearchTool.handler({
      libraryName: "react",
      query: "hooks",
    });

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain("error");
  });

  it("defaults missing optional fields", async () => {
    (resolveLibrary as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        libraryId: "/test/lib",
        name: "Lib",
        description: "A library",
        snippetCount: 0,
      },
    ]);

    const response = await docsSearchTool.handler({
      libraryName: "lib",
      query: "test",
    });

    const parsed = JSON.parse(response.content[0].text);
    expect(parsed.results[0]).toStrictEqual({
      libraryId: "/test/lib",
      name: "Lib",
      description: "A library",
      snippetCount: 0,
      reputation: "Unknown",
      benchmarkScore: 0,
    });
  });
});
