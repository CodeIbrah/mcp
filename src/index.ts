import { loadEnv } from "./config/env";
import { logger, initSentry, flushSentry } from "./observability";
import { createMcpServer, registerTools } from "./core";
import { githubTools } from "./tools/github";
import { context7Tools } from "./tools/context7";
import { exaTools } from "./tools/exa";

async function main(): Promise<void> {
  // 1. Load configuration
  loadEnv();
  logger.info("dev-mcp starting", { message: `Bun ${Bun.version} | ${process.platform}` });

  // 2. Initialize observability
  initSentry();

  // 3. Register all tools
  const tools = registerTools(githubTools, context7Tools, exaTools);
  logger.info(`Registered ${tools.length} tools`);

  // 4. Create and start MCP server
  const server = createMcpServer("dev-mcp", "1.0.0", tools);

  // Handle graceful shutdown
  const shutdown = async () => {
    logger.info("Shutting down...");
    await flushSentry();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // 5. Connect via stdio
  try {
    const { startServer } = await import("./core/server");
    await startServer(server);
  } catch (err) {
    logger.error("Failed to start server", { error: err });
    await flushSentry();
    process.exit(1);
  }
}

main();
