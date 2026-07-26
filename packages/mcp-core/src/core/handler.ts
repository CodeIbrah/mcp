import type { ZodType } from "zod";
import type { McpError } from "../utils/errors";
import { logger } from "../observability/logger";
import { captureError } from "../observability/sentry";
import type { ErrorCategory } from "../utils/errors";
import { validateInput } from "../security/validator";

/**
 * A tool handler function.
 * Receives validated arguments and returns an MCP tool response.
 */
export type ToolHandler = (args: Record<string, unknown>) => Promise<{
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}>;

/**
 * A registered tool definition.
 */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties?: Record<string, unknown>;
    required?: string[];
  };
  handler: ToolHandler;
}

/**
 * Convert a Zod schema to an MCP-compatible JSON Schema representation.
 */
function zodToMcpSchema(
  schema: ZodType<any, any, any>
): { type: "object"; properties?: Record<string, unknown>; required?: string[] } {
  try {
    const m = schema as unknown as { toJSONSchema?: () => Record<string, unknown> };
    const jsonSchema = m.toJSONSchema?.();
    if (jsonSchema && typeof jsonSchema === "object") {
      return {
        type: "object",
        properties: jsonSchema.properties as Record<string, unknown> | undefined,
        required: jsonSchema.required as string[] | undefined,
      };
    }
  } catch {
    // fall through
  }
  return { type: "object" };
}

/**
 * Wraps a tool handler with error handling, logging, and timing.
 * Uses a Zod schema for both validation and MCP schema generation.
 */
export function wrapTool<T>(
  name: string,
  description: string,
  schema: ZodType<T, any, any>,
  handler: (args: T) => Promise<{
    content: Array<{ type: "text"; text: string }>;
    isError?: boolean;
  }>
): ToolDefinition {
  const inputSchema = zodToMcpSchema(schema);

  return {
    name,
    description,
    inputSchema,
    handler: async (args) => {
      const start = performance.now();
      logger.info(`Tool called`, { toolName: name });

      try {
        const validated = validateInput(schema, args, name);
        const result = await handler(validated);
        const duration = performance.now() - start;
        logger.info(`Tool completed`, { toolName: name, durationMs: Math.round(duration) });
        return result;
      } catch (err) {
        const duration = performance.now() - start;

        if (err && typeof err === "object" && "category" in err) {
          const mcpErr = err as McpError;
          logger.error(`Tool failed`, {
            toolName: name,
            durationMs: Math.round(duration),
            error: mcpErr,
          });

          captureError(mcpErr, mcpErr.category as ErrorCategory, name);

          return {
            content: [
              {
                type: "text" as const,
                text: `[${mcpErr.category}] ${mcpErr.message}`,
              },
            ],
            isError: true,
          };
        }

        const error = err instanceof Error ? err : new Error(String(err));
        logger.error(`Tool internal error`, {
          toolName: name,
          durationMs: Math.round(duration),
          error,
        });

        captureError(error, "INTERNAL" as ErrorCategory, name);

        return {
          content: [
            {
              type: "text" as const,
              text: `[INTERNAL] Unexpected error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  };
}

/**
 * Combines multiple tool definitions into a single array.
 * Useful for merging tools from different modules.
 */
export function registerTools(...toolGroups: ToolDefinition[][]): ToolDefinition[] {
  const toolsMap = new Map<string, ToolDefinition>();

  for (const group of toolGroups) {
    for (const tool of group) {
      if (toolsMap.has(tool.name)) {
        logger.warn(`Duplicate tool registration: ${tool.name}. Using last definition.`);
      }
      toolsMap.set(tool.name, tool);
    }
  }

  return [...toolsMap.values()];
}
