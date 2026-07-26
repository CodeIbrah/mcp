import { getEnv } from "../config/env";

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

interface LogEntry {
  level: LogLevel;
  message: string;
  toolName?: string;
  durationMs?: number;
  error?: unknown;
  [key: string]: unknown;
}

function shouldLog(level: LogLevel): boolean {
  const current = getEnv().LOG_LEVEL;
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[current];
}

function formatLog(entry: LogEntry): string {
  const parts: string[] = [
    `[${entry.level.toUpperCase()}]`,
    entry.toolName ? `[${entry.toolName}]` : "",
    entry.message,
  ];

  if (entry.durationMs !== undefined) {
    parts.push(`(${entry.durationMs}ms)`);
  }

  if (entry.error instanceof Error) {
    parts.push(`- ${entry.error.message}`);
  }

  return parts.filter(Boolean).join(" ");
}

function sanitizeForLogging(obj: unknown): unknown {
  if (typeof obj === "string") {
    // Redact anything that looks like a token or key
    return obj.replace(
      /(gh[ps]_[a-zA-Z0-9]{36,}|sk-[a-zA-Z0-9]{32,}|fc-[a-zA-Z0-9]{32,})/g,
      "[REDACTED]"
    );
  }
  return obj;
}

export const logger = {
  debug(message: string, meta?: Partial<LogEntry>) {
    if (!shouldLog("debug")) return;
    const entry: LogEntry = { level: "debug", message, ...meta };
    console.error(formatLog(entry));
  },

  info(message: string, meta?: Partial<LogEntry>) {
    if (!shouldLog("info")) return;
    const entry: LogEntry = { level: "info", message, ...meta };
    console.error(formatLog(entry));
  },

  warn(message: string, meta?: Partial<LogEntry>) {
    if (!shouldLog("warn")) return;
    const entry: LogEntry = { level: "warn", message, ...meta };
    console.error(formatLog(entry));
  },

  error(message: string, meta?: Partial<LogEntry>) {
    if (!shouldLog("error")) return;
    const entry: LogEntry = {
      level: "error",
      message,
      error: meta?.error ? sanitizeForLogging(meta.error) : undefined,
      ...meta,
    };
    console.error(formatLog(entry));
  },
};
