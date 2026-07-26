import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { logger } from "../observability/logger";
import type { ToolDefinition } from "./handler";

export function createMcpServer(
  name: string,
  version: string,
  tools: ToolDefinition[]
): Server {
  const server = new Server(
    { name, version },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.debug("Listing tools", { toolName: "system" });
    return {
      tools: tools.map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
      })),
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const tool = tools.find((t) => t.name === name);
    if (!tool) {
      return {
        content: [{ type: "text" as const, text: `Unknown tool: ${name}` }],
        isError: true,
      };
    }

    return tool.handler(args ?? {});
  });

  return server;
}

export async function startServer(server: Server): Promise<void> {
  const transport = new StdioServerTransport();
  logger.info("Starting MCP server (stdio transport)");
  await server.connect(transport);
}
