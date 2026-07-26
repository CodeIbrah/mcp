/**
 * Categorised error types for the MCP server.
 *
 * Every error produced by the server must be one of these.
 * This guarantees consistent error handling, logging, and
 * observability grouping downstream.
 */

export enum ErrorCategory {
  Validation = "VALIDATION",
  Authentication = "AUTHENTICATION",
  Integration = "INTEGRATION",
  Network = "NETWORK",
  Timeout = "TIMEOUT",
  Internal = "INTERNAL",
  NotFound = "NOT_FOUND",
  RateLimit = "RATE_LIMIT",
}

export class McpError extends Error {
  public readonly category: ErrorCategory;
  public readonly toolName?: string;
  public readonly statusCode: number;
  public readonly retryable: boolean;

  constructor(opts: {
    message: string;
    category: ErrorCategory;
    toolName?: string;
    statusCode?: number;
    retryable?: boolean;
    cause?: unknown;
  }) {
    super(opts.message);
    this.name = "McpError";
    this.category = opts.category;
    this.toolName = opts.toolName;
    this.statusCode = opts.statusCode ?? 500;
    this.retryable = opts.retryable ?? false;
    this.cause = opts.cause;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      category: this.category,
      toolName: this.toolName,
      statusCode: this.statusCode,
      retryable: this.retryable,
    };
  }
}

export class ValidationError extends McpError {
  constructor(message: string, toolName?: string) {
    super({
      message,
      category: ErrorCategory.Validation,
      toolName,
      statusCode: 400,
    });
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends McpError {
  constructor(message: string, toolName?: string) {
    super({
      message,
      category: ErrorCategory.Authentication,
      toolName,
      statusCode: 401,
    });
    this.name = "AuthenticationError";
  }
}

export class IntegrationError extends McpError {
  constructor(message: string, toolName?: string, cause?: unknown) {
    super({
      message,
      category: ErrorCategory.Integration,
      toolName,
      statusCode: 502,
      retryable: true,
      cause,
    });
    this.name = "IntegrationError";
  }
}

export class NotFoundError extends McpError {
  constructor(message: string, toolName?: string) {
    super({
      message,
      category: ErrorCategory.NotFound,
      toolName,
      statusCode: 404,
    });
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends McpError {
  constructor(message: string, toolName?: string) {
    super({
      message,
      category: ErrorCategory.RateLimit,
      toolName,
      statusCode: 429,
      retryable: true,
    });
    this.name = "RateLimitError";
  }
}
