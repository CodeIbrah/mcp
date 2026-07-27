import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import { wrapTool, registerTools } from "./handler";

const testSchema = z.object({
  name: z.string(),
  count: z.number().optional(),
});

async function runHandler(
  definition: ReturnType<typeof wrapTool>,
  args: Record<string, unknown>,
) {
  return definition.handler(args);
}

describe("wrapTool", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("creates a ToolDefinition with correct name, description, and inputSchema", () => {
    const handler = vi.fn().mockResolvedValue({
      content: [{ type: "text" as const, text: "done" }],
    });

    const def = wrapTool("myTool", "Does something", testSchema, handler);

    expect(def.name).toBe("myTool");
    expect(def.description).toBe("Does something");
    expect(def.inputSchema).toStrictEqual({
      type: "object",
      properties: expect.any(Object),
      required: expect.any(Array),
    });
  });

  it("calls the handler with validated args", async () => {
    const handler = vi.fn().mockResolvedValue({
      content: [{ type: "text" as const, text: "ok" }],
    });

    const def = wrapTool("test", "desc", testSchema, handler);
    await runHandler(def, { name: "Alice", count: 3 });

    expect(handler).toHaveBeenCalledWith({ name: "Alice", count: 3 });
  });

  it("returns response in MCP content format", async () => {
    const handler = vi.fn().mockResolvedValue({
      content: [{ type: "text" as const, text: "result" }],
    });

    const def = wrapTool("fmt", "desc", testSchema, handler);
    const result = await runHandler(def, { name: "X" });

    expect(result).toStrictEqual({
      content: [{ type: "text", text: "result" }],
    });
  });

  it("returns isError response on validation failure (missing required field)", async () => {
    const handler = vi.fn();
    const def = wrapTool("errTool", "desc", testSchema, handler);

    const result = await runHandler(def, {});

    expect(result).toStrictEqual({
      content: [{ type: "text", text: expect.stringContaining("[VALIDATION]") }],
      isError: true,
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it("returns isError response when handler throws a generic Error", async () => {
    const handler = vi.fn().mockRejectedValue(new Error("unexpected crash"));

    const def = wrapTool("crashTool", "desc", testSchema, handler);
    const result = await runHandler(def, { name: "X" });

    expect(result).toStrictEqual({
      content: [{ type: "text", text: "[INTERNAL] Unexpected error: unexpected crash" }],
      isError: true,
    });
  });

  it("logs timing info on success via console.error", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const handler = vi.fn().mockResolvedValue({
      content: [{ type: "text" as const, text: "done" }],
    });

    const def = wrapTool("timed", "desc", testSchema, handler);
    await runHandler(def, { name: "T" });

    expect(spy).toHaveBeenCalledWith(expect.stringContaining("[INFO]"));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("[timed]"));
    spy.mockRestore();
  });

  it("logs error on validation failure", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const handler = vi.fn();

    const def = wrapTool("failTool", "desc", testSchema, handler);
    await runHandler(def, {});

    expect(spy).toHaveBeenCalledWith(expect.stringContaining("[ERROR]"));
    spy.mockRestore();
  });

  it("handles non-Error thrown values gracefully", async () => {
    const handler = vi.fn().mockRejectedValue("string error message");

    const def = wrapTool("strErr", "desc", testSchema, handler);
    const result = await runHandler(def, { name: "X" });

    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toContain("string error message");
  });
});

describe("registerTools", () => {
  it("merges multiple tool groups", () => {
    const toolA = {
      name: "a",
      description: "tool a",
      inputSchema: { type: "object" as const },
      handler: vi.fn(),
    };
    const toolB = {
      name: "b",
      description: "tool b",
      inputSchema: { type: "object" as const },
      handler: vi.fn(),
    };

    const result = registerTools([toolA], [toolB]);
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.name)).toEqual(["a", "b"]);
  });

  it("deduplicates by name, keeping the last definition", () => {
    const handlerA = vi.fn();
    const handlerB = vi.fn();
    const toolA = {
      name: "dup",
      description: "first",
      inputSchema: { type: "object" as const },
      handler: handlerA,
    };
    const toolB = {
      name: "dup",
      description: "last",
      inputSchema: { type: "object" as const },
      handler: handlerB,
    };

    const result = registerTools([toolA], [toolB]);
    expect(result).toHaveLength(1);
    expect(result[0]!.description).toBe("last");
    expect(result[0]!.handler).toBe(handlerB);
  });

  it("returns empty array for no groups", () => {
    expect(registerTools()).toStrictEqual([]);
  });
});
