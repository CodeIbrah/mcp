/**
 * @module mcp-server/server — stdio transport init (placeholder).
 * Fase 2: Replace with Bun.serve + StreamableHTTPServerTransport + auth.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

export async function startServer(server: Server): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
