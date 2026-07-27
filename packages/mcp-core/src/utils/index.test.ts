import { describe, it, expect } from "vitest";
import {
  McpError,
  ValidationError,
  AuthenticationError,
  IntegrationError,
  NotFoundError,
  RateLimitError,
  ErrorCategory,
} from "./errors";
import * as utilsIndex from "./index";

describe("utils barrel export", () => {
  it("re-exports McpError", () => {
    expect(utilsIndex.McpError).toBe(McpError);
  });

  it("re-exports ValidationError", () => {
    expect(utilsIndex.ValidationError).toBe(ValidationError);
  });

  it("re-exports AuthenticationError", () => {
    expect(utilsIndex.AuthenticationError).toBe(AuthenticationError);
  });

  it("re-exports IntegrationError", () => {
    expect(utilsIndex.IntegrationError).toBe(IntegrationError);
  });

  it("re-exports NotFoundError", () => {
    expect(utilsIndex.NotFoundError).toBe(NotFoundError);
  });

  it("re-exports RateLimitError", () => {
    expect(utilsIndex.RateLimitError).toBe(RateLimitError);
  });

  it("re-exports ErrorCategory", () => {
    expect(utilsIndex.ErrorCategory).toBe(ErrorCategory);
  });
});
