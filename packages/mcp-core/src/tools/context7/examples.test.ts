import { describe, it, expect, vi } from "vitest";
import { examplesGetTool } from "./examples";
import { queryDocs } from "./client";

vi.mock("./client", () => ({
  queryDocs: vi.fn(),
}));

const exampleContent =
  "```jsx\nimport { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;\n}\n```";

describe("examplesGetTool", () => {
  it("returns code examples with prefixed query", async () => {
    (queryDocs as ReturnType<typeof vi.fn>).mockResolvedValue(exampleContent);

    const response = await examplesGetTool.handler({
      libraryId: "/react/react",
      query: "useState counter",
    });

    expect(queryDocs).toHaveBeenCalledWith("/react/react", "code examples: useState counter");
    expect(response.isError).toBeUndefined();
    expect(response.content[0].text).toBe(exampleContent);
  });

  it("returns empty string when no examples found", async () => {
    (queryDocs as ReturnType<typeof vi.fn>).mockResolvedValue("");

    const response = await examplesGetTool.handler({
      libraryId: "/react/react",
      query: "obscure-api",
    });

    expect(response.content[0].text).toBe("");
  });

  it("handles errors from queryDocs", async () => {
    (queryDocs as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("API error"));

    const response = await examplesGetTool.handler({
      libraryId: "/react/react",
      query: "hooks",
    });

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain("error");
  });

  it("passes correct prefix for query", async () => {
    (queryDocs as ReturnType<typeof vi.fn>).mockResolvedValue("example");

    await examplesGetTool.handler({
      libraryId: "/test/lib",
      query: "custom hook",
    });

    expect(queryDocs).toHaveBeenCalledWith("/test/lib", "code examples: custom hook");
  });
});
