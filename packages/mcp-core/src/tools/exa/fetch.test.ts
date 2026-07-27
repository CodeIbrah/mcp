import { describe, it, expect, vi } from "vitest";
import { webFetchTool } from "./fetch";
import { exaFetch } from "./client";

vi.mock("./client", () => ({
  exaFetch: vi.fn(),
}));

const pageContent = "# React\n\nReact is a JavaScript library for building user interfaces.";

describe("webFetchTool", () => {
  it("returns fetched page content", async () => {
    (exaFetch as ReturnType<typeof vi.fn>).mockResolvedValue(pageContent);

    const response = await webFetchTool.handler({
      url: "https://react.dev/learn",
    });

    expect(exaFetch).toHaveBeenCalledWith("https://react.dev/learn");
    expect(response.isError).toBeUndefined();

    const parsed = JSON.parse(response.content[0].text);
    expect(parsed).toStrictEqual({ url: "https://react.dev/learn", content: pageContent });
  });

  it("handles fetch failure with empty content", async () => {
    (exaFetch as ReturnType<typeof vi.fn>).mockResolvedValue("");

    const response = await webFetchTool.handler({
      url: "https://example.com/empty",
    });

    const parsed = JSON.parse(response.content[0].text);
    expect(parsed.content).toBe("");
  });

  it("handles errors from exaFetch", async () => {
    (exaFetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Fetch failed"));

    const response = await webFetchTool.handler({
      url: "https://react.dev/learn",
    });

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain("error");
  });

  it("truncates content over 30000 characters", async () => {
    const longContent = "x".repeat(35000);
    (exaFetch as ReturnType<typeof vi.fn>).mockResolvedValue(longContent);

    const response = await webFetchTool.handler({
      url: "https://example.com/long",
    });

    const parsed = JSON.parse(response.content[0].text);
    expect(parsed.content.length).toBe(
      30000 + "\n\n... [content truncated at 30000 chars]".length,
    );
    expect(parsed.content).toContain("[content truncated at 30000 chars]");
  });
});
