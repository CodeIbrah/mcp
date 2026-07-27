#!/usr/bin/env node

/**
 * dev-mcp installer — `npx dev-mcp setup`
 *
 * Detects opencode, Cursor, VS Code, and Claude installations
 * and writes the MCP server config for each detected tool.
 */

import { Command } from "commander";
import { detectTools, buildServerConfig } from "./utils/paths.js";
import { writeOpencode, writeCursor, writeVSCode, writeClaude } from "./utils/config.js";

const pkg = { version: "0.1.0" };

const program = new Command()
  .name("dev-mcp")
  .description("MCP server installer and configurator for dev-mcp")
  .version(pkg.version);

// ── detect ──────────────────────────────────────────────

program
  .command("detect")
  .description("Detect installed AI coding tools")
  .action(() => {
    const tools = detectTools();
    console.log("\n  🔍 Detected AI coding tools:\n");

    let found = 0;
    for (const tool of tools) {
      const icon = tool.exists ? "✅" : "  ";
      const status = tool.exists ? `found at ${tool.configPath}` : "not found";
      console.log(`  ${icon} ${tool.name.padEnd(16)} ${status}`);
      if (tool.exists) found++;
    }

    console.log(`\n  ${found} tool(s) detected. Run \`dev-mcp setup\` to configure.\n`);
  });

// ── setup ───────────────────────────────────────────────

program
  .command("setup")
  .description("Detect tools and write MCP server config")
  .option("--stdio", "Configure for stdio transport (default)")
  .option("--http", "Configure for HTTP transport")
  .option("--host <host>", "HTTP host", "0.0.0.0")
  .option("--port <port>", "HTTP port", "3001")
  .action((options: { stdio?: boolean; http?: boolean; host: string; port: string }) => {
    const mode = options.http ? "http" : "stdio";
    const config = buildServerConfig({
      mode,
      host: options.host,
      port: parseInt(options.port, 10),
    });

    const tools = detectTools();
    const written: string[] = [];

    console.log(`\n  📦 Configuring dev-mcp (${mode} mode)...\n`);

    for (const tool of tools) {
      if (!tool.exists) continue;

      try {
        let target: string;
        switch (tool.name) {
          case "opencode":
            target = writeOpencode(config);
            break;
          case "cursor":
            target = writeCursor(config);
            break;
          case "vscode":
            target = writeVSCode(config);
            break;
          case "claude-desktop":
          case "claude-cli":
            target = writeClaude(config, tool.configPath);
            break;
          default:
            continue;
        }
        written.push(target);
        console.log(`  ✅ ${tool.name.padEnd(16)} ${target}`);
      } catch (err) {
        console.log(`  ⚠️  ${tool.name.padEnd(16)} ${err instanceof Error ? err.message : "unknown error"}`);
      }
    }

    if (written.length === 0) {
      console.log("  No AI coding tools detected. Run `dev-mcp detect` to list.");
      console.log("  Make sure you're in your project root directory.\n");
    } else {
      console.log(`\n  ✅ Wrote ${written.length} config file(s). Restart your AI tool to apply.\n`);
    }
  });

program.parse(process.argv);
