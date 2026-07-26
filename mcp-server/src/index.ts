/**
 * @module mcp-server — Entry point for Streamable HTTP transport.
 * Thin wrapper for server/collective deployment (Docker/K8s).
 * Fase 2 will replace stdio with StreamableHTTPServerTransport + auth.
 */
import { loadEnv, logger, initSentry, flushSentry, createMcpServer, registerTools } from "@dev-mcp/core";
import { githubTools } from "@dev-mcp/core/tools/github";
import { context7Tools } from "@dev-mcp/core/tools/context7";
import { exaTools } from "@dev-mcp/core/tools/exa";

async function main(): Promise<void> {
  loadEnv();
  logger.info("dev-mcp (server) starting", { message: `Bun ${Bun.version} | ${process.platform}` });

  initSentry();

  const tools = registerTools(githubTools, context7Tools, exaTools);
  logger.info(`Registered ${tools.length} tools`);

  const server = createMcpServer("dev-mcp-server", "1.0.0", tools);

  const shutdown = async () => {
    logger.info("Shutting down...");
    await flushSentry();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  try {
    // Fase 2: Replace with StreamableHTTPServerTransport
    const { startServer } = await import("./server");
    await startServer(server);
  } catch (err) {
    logger.error("Failed to start server", { error: err });
    await flushSentry();
    process.exit(1);
  }
}

main();
