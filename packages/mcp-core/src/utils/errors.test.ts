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

describe("ErrorCategory", () => {
  it("has all expected enum values", () => {
    expect(ErrorCategory.Validation).toBe("VALIDATION");
    expect(ErrorCategory.Authentication).toBe("AUTHENTICATION");
    expect(ErrorCategory.Integration).toBe("INTEGRATION");
    expect(ErrorCategory.Network).toBe("NETWORK");
    expect(ErrorCategory.Timeout).toBe("TIMEOUT");
    expect(ErrorCategory.Internal).toBe("INTERNAL");
    expect(ErrorCategory.NotFound).toBe("NOT_FOUND");
    expect(ErrorCategory.RateLimit).toBe("RATE_LIMIT");
  });
});

describe("McpError", () => {
  it("sets all constructor fields", () => {
    const err = new McpError({
      message: "something went wrong",
      category: ErrorCategory.Validation,
      toolName: "myTool",
      statusCode: 400,
      retryable: false,
    });

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("McpError");
    expect(err.message).toBe("something went wrong");
    expect(err.category).toBe(ErrorCategory.Validation);
    expect(err.toolName).toBe("myTool");
    expect(err.statusCode).toBe(400);
    expect(err.retryable).toBe(false);
  });

  it("defaults statusCode to 500 and retryable to false", () => {
    const err = new McpError({
      message: "defaults",
      category: ErrorCategory.Internal,
    });

    expect(err.statusCode).toBe(500);
    expect(err.retryable).toBe(false);
    expect(err.toolName).toBeUndefined();
  });

  it("accepts a cause", () => {
    const cause = new Error("root cause");
    const err = new McpError({
      message: "wrapped",
      category: ErrorCategory.Integration,
      cause,
    });

    expect(err.cause).toBe(cause);
  });

  it("toJSON returns a plain object with all fields", () => {
    const err = new McpError({
      message: "json test",
      category: ErrorCategory.RateLimit,
      toolName: "rateTool",
      statusCode: 429,
      retryable: true,
    });

    expect(err.toJSON()).toStrictEqual({
      name: "McpError",
      message: "json test",
      category: ErrorCategory.RateLimit,
      toolName: "rateTool",
      statusCode: 429,
      retryable: true,
    });
  });
});

describe("ValidationError", () => {
  it("sets statusCode 400 and retryable false", () => {
    const err = new ValidationError("invalid input");

    expect(err).toBeInstanceOf(McpError);
    expect(err.name).toBe("ValidationError");
    expect(err.category).toBe(ErrorCategory.Validation);
    expect(err.statusCode).toBe(400);
    expect(err.retryable).toBe(false);
  });

  it("accepts optional toolName", () => {
    const err = new ValidationError("bad", "myTool");
    expect(err.toolName).toBe("myTool");
  });
});

describe("AuthenticationError", () => {
  it("sets statusCode 401 and retryable defaults to false", () => {
    const err = new AuthenticationError("unauthorized");

    expect(err).toBeInstanceOf(McpError);
    expect(err.name).toBe("AuthenticationError");
    expect(err.category).toBe(ErrorCategory.Authentication);
    expect(err.statusCode).toBe(401);
    expect(err.retryable).toBe(false);
  });

  it("accepts optional toolName", () => {
    const err = new AuthenticationError("bad auth", "authTool");
    expect(err.toolName).toBe("authTool");
  });
});

describe("IntegrationError", () => {
  it("sets statusCode 502 and retryable true", () => {
    const err = new IntegrationError("integration failed");

    expect(err).toBeInstanceOf(McpError);
    expect(err.name).toBe("IntegrationError");
    expect(err.category).toBe(ErrorCategory.Integration);
    expect(err.statusCode).toBe(502);
    expect(err.retryable).toBe(true);
  });

  it("accepts cause and toolName", () => {
    const cause = new Error("api down");
    const err = new IntegrationError("failed", "gitTool", cause);

    expect(err.toolName).toBe("gitTool");
    expect(err.cause).toBe(cause);
  });
});

describe("NotFoundError", () => {
  it("sets statusCode 404 and retryable false", () => {
    const err = new NotFoundError("resource not found");

    expect(err).toBeInstanceOf(McpError);
    expect(err.name).toBe("NotFoundError");
    expect(err.category).toBe(ErrorCategory.NotFound);
    expect(err.statusCode).toBe(404);
    expect(err.retryable).toBe(false);
  });

  it("accepts optional toolName", () => {
    const err = new NotFoundError("missing", "getTool");
    expect(err.toolName).toBe("getTool");
  });
});

describe("RateLimitError", () => {
  it("sets statusCode 429 and retryable true", () => {
    const err = new RateLimitError("too many requests");

    expect(err).toBeInstanceOf(McpError);
    expect(err.name).toBe("RateLimitError");
    expect(err.category).toBe(ErrorCategory.RateLimit);
    expect(err.statusCode).toBe(429);
    expect(err.retryable).toBe(true);
  });

  it("accepts optional toolName", () => {
    const err = new RateLimitError("slow down", "rateTool");
    expect(err.toolName).toBe("rateTool");
  });
});
