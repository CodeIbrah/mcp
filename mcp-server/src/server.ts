/**
 * @module mcp-server/server — Streamable HTTP transport via Bun.serve.
 *
 * Uses WebStandardStreamableHTTPServerTransport for native Web API
 * compatibility with Bun. Supports both stdio (local dev) and HTTP
 * (server/collective deployment in Docker/K8s).
 *
 * Endpoints:
 *   POST /  — MCP protocol via Streamable HTTP
 *   GET  /health — health check
 *   OPTIONS / — CORS preflight
 */
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { getEnv, logger } from "@dev-mcp/core";

export interface ServerHandle {
  /** Gracefully stop the HTTP server. */
  stop: () => void;
}

/**
 * Minimal MCP Server shape that supports connect(transport).
 * Avoids bundler type conflicts with the SDK's Server class.
 */
interface McpServer {
  connect(transport: Transport): Promise<void>;
}

export async function startServer(server: McpServer): Promise<ServerHandle> {
  const env = getEnv();
  const host = env.HOST;
  const port = env.PORT;

  const transport = new WebStandardStreamableHTTPServerTransport();

  // Connect MCP Server to transport first — sessions are managed
  // by the transport via handleRequest().
  await server.connect(transport);

  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": env.CORS_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, MCP-Protocol-Version, MCP-Session-Id",
    "Access-Control-Expose-Headers": "MCP-Protocol-Version, MCP-Session-Id",
  };

  const httpServer = Bun.serve({
    hostname: host,
    port,
    async fetch(req: Request): Promise<Response> {
      const url = new URL(req.url);

      // CORS preflight
      if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders, status: 204 });
      }

      // Health check — no CORS needed for GET health
      if (req.method === "GET" && url.pathname === "/health") {
        return Response.json(
          { status: "ok", uptime: process.uptime(), version: "1.0.0" },
          { headers: corsHeaders }
        );
      }

      // MCP protocol — POST to /
      if (req.method === "POST" && url.pathname === "/") {
        try {
          const mcpResponse = await transport.handleRequest(req);
          // Create a new Response with CORS headers merged
          return new Response(mcpResponse.body, {
            status: mcpResponse.status,
            statusText: mcpResponse.statusText,
            headers: {
              ...Object.fromEntries(mcpResponse.headers.entries()),
              ...corsHeaders,
            },
          });
        } catch (err) {
          logger.error("HTTP transport error", { error: err });
          const body = JSON.stringify({
            jsonrpc: "2.0",
            error: { code: -32000, message: "Internal server error" },
            id: null,
          });
          return new Response(body, {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      return new Response("Not Found", { status: 404, headers: corsHeaders });
    },
  });

  logger.info(`MCP HTTP server listening`, {
    message: `http://${host}:${port}`,
    host,
    port,
  });

  return {
    stop: () => {
      logger.info("Stopping HTTP server...");
      httpServer.stop();
    },
  };
}
