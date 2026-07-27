import { describe, it, expect } from "vitest";
import { z } from "zod";
import { validateInput } from "./validator";
import { ValidationError, McpError } from "../utils/errors";

describe("validateInput", () => {
  const basicSchema = z.object({
    name: z.string(),
    age: z.number().optional(),
  });

  it("passes valid input through unchanged", () => {
    const input = { name: "Alice", age: 30 };
    const result = validateInput(basicSchema, input, "myTool");
    expect(result).toStrictEqual(input);
  });

  it("allows optional fields to be omitted", () => {
    const input = { name: "Bob" };
    const result = validateInput(basicSchema, input, "myTool");
    expect(result).toStrictEqual(input);
  });

  it("throws ValidationError when required field is missing", () => {
    expect(() => validateInput(basicSchema, { age: 30 }, "myTool"))
      .toThrow(ValidationError);
  });

  it("throws McpError for type mismatch", () => {
    expect(() => validateInput(basicSchema, { name: 42 }, "myTool"))
      .toThrow(McpError);
  });

  it("strips extra unknown fields (Zod v4 default behavior)", () => {
    const input = { name: "Charlie", extra: "should be stripped" };
    const result = validateInput(basicSchema, input, "myTool");
    expect(result).not.toHaveProperty("extra");
    expect(result).toStrictEqual({ name: "Charlie" });
  });

  it("validates nested object schemas", () => {
    const nestedSchema = z.object({
      user: z.object({ email: z.string().email() }),
    });
    const input = { user: { email: "alice@example.com" } };
    const result = validateInput(nestedSchema, input, "nestedTool");
    expect(result).toStrictEqual(input);
  });

  it("throws ValidationError for invalid nested fields", () => {
    const nestedSchema = z.object({
      user: z.object({ email: z.string().email() }),
    });
    expect(() =>
      validateInput(nestedSchema, { user: { email: "not-an-email" } }, "nestedTool"),
    ).toThrow(ValidationError);
  });

  it("throws McpError for null input", () => {
    expect(() => validateInput(basicSchema, null, "myTool")).toThrow(McpError);
  });

  it("throws McpError for undefined input", () => {
    expect(() => validateInput(basicSchema, undefined, "myTool")).toThrow(McpError);
  });

  it("error message includes the tool name", () => {
    expect(() => validateInput(basicSchema, {}, "myTool")).toThrow(/myTool/);
  });

  it("error message includes field paths on failure", () => {
    expect(() => validateInput(basicSchema, {}, "testTool")).toThrow(/name/);
  });
});
