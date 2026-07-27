import { describe, it, expect, vi } from "vitest";
import { apiLookupTool } from "./api";
import { queryDocs } from "./client";

vi.mock("./client", () => ({
  queryDocs: vi.fn(),
}));

const apiContent =
  "## useState\n\n`useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>]`\n\nReturns a stateful value and a function to update it.";

describe("apiLookupTool", () => {
  it("returns API documentation with symbol prefix", async () => {
    (queryDocs as ReturnType<typeof vi.fn>).mockResolvedValue(apiContent);

    const response = await apiLookupTool.handler({
      libraryId: "/react/react",
      symbol: "useState",
    });

    expect(queryDocs).toHaveBeenCalledWith("/react/react", "API reference: useState");
    expect(response.isError).toBeUndefined();
    expect(response.content[0].text).toBe(apiContent);
  });

  it("returns empty string when symbol not found", async () => {
    (queryDocs as ReturnType<typeof vi.fn>).mockResolvedValue("");

    const response = await apiLookupTool.handler({
      libraryId: "/react/react",
      symbol: "useNonexistent",
    });

    expect(response.content[0].text).toBe("");
  });

  it("handles errors from queryDocs", async () => {
    (queryDocs as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("API error"));

    const response = await apiLookupTool.handler({
      libraryId: "/react/react",
      symbol: "useState",
    });

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain("error");
  });

  it("passes correct prefix for symbol lookup", async () => {
    (queryDocs as ReturnType<typeof vi.fn>).mockResolvedValue("result");

    await apiLookupTool.handler({
      libraryId: "/test/lib",
      symbol: "createContext",
    });

    expect(queryDocs).toHaveBeenCalledWith("/test/lib", "API reference: createContext");
  });
});
