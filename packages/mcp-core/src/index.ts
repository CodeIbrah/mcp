/**
 * @module @dev-mcp/core — Library entry point.
 * Exports all public API: config, core server, tools, security, observability, utils.
 */
export { loadEnv, getEnv } from "./config/env";
export type { Env } from "./config/env";
export { createMcpServer, registerTools } from "./core";
export type { ToolDefinition, ToolHandler } from "./core/handler";
export { validateInput } from "./security/validator";
export { logger, initSentry, flushSentry } from "./observability";
export {
  McpError,
  ValidationError,
  AuthenticationError,
  IntegrationError,
  NotFoundError,
  RateLimitError,
  ErrorCategory,
} from "./utils/errors";
export type { ErrorCategory as ErrorCategoryType } from "./utils/errors";
