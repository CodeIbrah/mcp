/**
 * Config file writers for each AI coding tool.
 * Handles reading, merging, and writing MCP server configurations.
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import type { ServerConfig } from "./paths";

// ── Helpers ─────────────────────────────────────────────

function readJson(path: string): any {
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

function writeJson(path: string, data: any): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

/**
 * Simple JSONC reader/writer that preserves comments by only
 * modifying the first JSON-level key. Falls through to JSON if unparseable.
 */
function readJsonc(path: string): { data: any; raw: string } | null {
  try {
    const raw = readFileSync(path, "utf-8");
    // Strip comments for parsing
    const stripped = raw
      .replace(/\/\/.*$/gm, "")
      .replace(/\/\*[\s\S]*?\*\//g, "");
    const data = JSON.parse(stripped);
    return { data, raw };
  } catch {
    return null;
  }
}

function writeJsoncRaw(path: string, data: any): void {
  const json = JSON.stringify(data, null, 2);
  // Reconstruct as JSONC with the schema reference if present
  const result = json.replace(
    /^\{/,
    '{',
  );
  writeFileSync(path, result, "utf-8");
}

// ── Writers ─────────────────────────────────────────────

/**
 * Opencode: ~/.config/opencode/opencode.jsonc
 * Config goes under the top-level "mcp" key, matching existing pattern.
 */
export function writeOpencode(config: ServerConfig): string {
  const localPath = join(process.cwd(), ".opencode", "opencode.jsonc");
  const target = localPath; // Always write local first when in project dir

  const entry = {
    enabled: true,
    ...(config.command
      ? {
          type: "stdio" as const,
          command: config.command,
          args: config.args,
          env: config.env || {},
        }
      : {
          type: "remote" as const,
          url: config.url!,
          headers: config.headers || {},
        }),
  };

  const existing = readJsonc(target);
  if (existing) {
    existing.data.mcp = existing.data.mcp || {};
    existing.data.mcp["dev-mcp"] = entry;
    writeJsoncRaw(target, existing.data);
  } else {
    const data: any = {
      $schema: "https://opencode.ai/config.json",
      mcp: {
        "dev-mcp": entry,
      },
    };
    writeJsoncRaw(target, data);
  }

  return target;
}

/**
 * Cursor: .cursor/mcp.json in project root
 */
export function writeCursor(config: ServerConfig): string {
  const target = join(process.cwd(), ".cursor", "mcp.json");

  const entry: Record<string, any> = {};
  if (config.command) {
    entry.type = "stdio";
    entry.command = config.command;
    entry.args = config.args;
  } else {
    entry.type = "remote";
    entry.url = config.url!;
    entry.headers = config.headers;
  }

  const existing = readJson(target);
  if (existing) {
    existing.mcpServers = existing.mcpServers || {};
    existing.mcpServers["dev-mcp"] = entry;
    writeJson(target, existing);
  } else {
    writeJson(target, { mcpServers: { "dev-mcp": entry } });
  }

  return target;
}

/**
 * VS Code: .vscode/mcp.json in project root
 */
export function writeVSCode(config: ServerConfig): string {
  const target = join(process.cwd(), ".vscode", "mcp.json");

  const entry: Record<string, any> = {};
  if (config.command) {
    entry.command = config.command;
    entry.args = config.args;
    entry.env = config.env;
  }

  const existing = readJson(target);
  if (existing) {
    existing.mcpServers = existing.mcpServers || {};
    existing.mcpServers["dev-mcp"] = entry;
    writeJson(target, existing);
  } else {
    writeJson(target, { mcpServers: { "dev-mcp": entry } });
  }

  return target;
}

/**
 * Claude Desktop: platform-specific config file
 * Claude CLI: ~/.claude/settings.json
 */
export function writeClaude(config: ServerConfig, desktopPath: string): string {
  const entry: Record<string, any> = {};
  if (config.command) {
    entry.command = config.command;
    entry.args = config.args;
    entry.env = config.env;
  } else {
    // Claude doesn't support remote MCP natively — skip
    throw new Error("Claude Desktop only supports stdio MCP servers");
  }

  const existing = readJson(desktopPath);
  if (existing) {
    existing.mcpServers = existing.mcpServers || {};
    existing.mcpServers["dev-mcp"] = entry;
    writeJson(desktopPath, existing);
  } else {
    writeJson(desktopPath, { mcpServers: { "dev-mcp": entry } });
  }

  return desktopPath;
}
