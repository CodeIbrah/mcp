import { describe, it, expect, vi } from "vitest";
import { docsGetTool } from "./docs";
import { queryDocs } from "./client";

vi.mock("./client", () => ({
  queryDocs: vi.fn(),
}));

const docContent = "React hooks let you use state and other React features without writing a class.";

describe("docsGetTool", () => {
  it("returns documentation content", async () => {
    (queryDocs as ReturnType<typeof vi.fn>).mockResolvedValue(docContent);

    const response = await docsGetTool.handler({
      libraryId: "/react/react",
      query: "hooks",
    });

    expect(queryDocs).toHaveBeenCalledWith("/react/react", "hooks");
    expect(response.isError).toBeUndefined();
    expect(response.content[0].text).toBe(docContent);
  });

  it("returns empty string when no content found", async () => {
    (queryDocs as ReturnType<typeof vi.fn>).mockResolvedValue("");

    const response = await docsGetTool.handler({
      libraryId: "/react/react",
      query: "nonexistent",
    });

    expect(response.content[0].text).toBe("");
  });

  it("handles errors from queryDocs", async () => {
    (queryDocs as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("API error"));

    const response = await docsGetTool.handler({
      libraryId: "/react/react",
      query: "hooks",
    });

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain("error");
  });

  it("returns multiline documentation content", async () => {
    const multiline =
      "# useState\n\nReturns a stateful value and a function to update it.\n\n```jsx\nconst [count, setCount] = useState(0);\n```";
    (queryDocs as ReturnType<typeof vi.fn>).mockResolvedValue(multiline);

    const response = await docsGetTool.handler({
      libraryId: "/react/react",
      query: "useState",
    });

    expect(response.content[0].text).toBe(multiline);
  });
});
