/**
 * Platform-aware path detection for AI coding tool config files.
 */

import { homedir, platform } from "os";
import { join } from "path";
import { existsSync } from "fs";

export interface DetectedTool {
  name: string;
  configPath: string;
  format: "json" | "jsonc";
  exists: boolean;
}

/**
 * Detect installed AI coding tools and return their config file paths.
 */
export function detectTools(): DetectedTool[] {
  const home = homedir();
  const isWin = platform() === "win32";

  const tools: DetectedTool[] = [];

  // — opencode —
  // Priority: .opencode/opencode.jsonc in CWD → ~/.config/opencode/opencode.jsonc
  const opencodeLocal = join(process.cwd(), ".opencode", "opencode.jsonc");
  const opencodeGlobal = join(home, ".config", "opencode", "opencode.jsonc");
  const opencodePath = existsSync(opencodeLocal) ? opencodeLocal : opencodeGlobal;
  tools.push({
    name: "opencode",
    configPath: opencodePath,
    format: "jsonc",
    exists: existsSync(opencodePath),
  });

  // — Cursor —
  const cursorPath = join(process.cwd(), ".cursor", "mcp.json");
  tools.push({
    name: "cursor",
    configPath: cursorPath,
    format: "json",
    exists: existsSync(cursorPath),
  });

  // — VS Code —
  const vscodePath = join(process.cwd(), ".vscode", "mcp.json");
  tools.push({
    name: "vscode",
    configPath: vscodePath,
    format: "json",
    exists: existsSync(vscodePath),
  });

  // — Claude Desktop (platform-aware) —
  let claudePath: string;
  if (isWin) {
    const appData = process.env.APPDATA || join(home, "AppData", "Roaming");
    claudePath = join(appData, "Claude", "claude_desktop_config.json");
  } else if (platform() === "darwin") {
    claudePath = join(home, "Library", "Application Support", "Claude", "claude_config.json");
  } else {
    claudePath = join(home, ".config", "Claude", "claude_desktop_config.json");
  }
  // Also check ~/.claude/settings.json (Claude Code CLI)
  const claudeCliPath = join(home, ".claude", "settings.json");
  tools.push({
    name: "claude-desktop",
    configPath: claudePath,
    format: "json",
    exists: existsSync(claudePath),
  });
  tools.push({
    name: "claude-cli",
    configPath: claudeCliPath,
    format: "json",
    exists: existsSync(claudeCliPath),
  });

  return tools;
}

export interface ServerConfig {
  /** Stdio config: command + args */
  command?: string;
  args?: string[];

  /** HTTP config: url + optional headers */
  url?: string;
  headers?: Record<string, string>;

  /** opencode-specific: enabled flag */
  enabled?: boolean;

  /** Environment variables */
  env?: Record<string, string>;
}

/**
 * Build the dev-mcp server config depending on transport mode.
 */
export function buildServerConfig(options: {
  mode: "stdio" | "http";
  host?: string;
  port?: number;
  projectDir?: string;
}): ServerConfig {
  if (options.mode === "stdio") {
    return {
      command: "bun",
      args: ["run", "mcp-personal"],
      env: {},
    };
  }

  // HTTP mode — points to the running server
  const host = options.host || "0.0.0.0";
  const port = options.port || 3001;
  return {
    url: `http://${host === "0.0.0.0" ? "localhost" : host}:${port}`,
    headers: {},
  };
}
