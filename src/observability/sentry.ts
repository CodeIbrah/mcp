import { getEnv } from "../config/env";
import { logger } from "./logger";
import type { ErrorCategory } from "../utils/errors";

/**
 * Minimal Sentry client for error tracking.
 *
 * Uses the Sentry Envelope API directly to avoid pulling in
 * the full Sentry SDK. If SENTRY_DSN is not configured,
 * all calls are no-ops.
 */

interface SentryEvent {
  event_id: string;
  timestamp: string;
  platform: string;
  level: string;
  logger?: string;
  culprit?: string;
  exception?: {
    values: Array<{
      type: string;
      value: string;
      stacktrace?: { frames: Array<{ filename: string; function: string; lineno: number }> };
    }>;
  };
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  contexts?: Record<string, Record<string, unknown>>;
}

let dsn: string | null = null;
let environment = "development";
let enabled = false;

function parseDsn(raw: string): { host: string; projectId: string; publicKey: string } | null {
  // sentry DSN format: https://publicKey@host/projectId
  const match = /https:\/\/([^@]+)@([^/]+)\/(\d+)/.exec(raw);
  if (!match) return null;
  return { publicKey: match[1]!, host: match[2]!, projectId: match[3]! };
}

export function initSentry(): void {
  const cfg = getEnv();
  dsn = cfg.SENTRY_DSN ?? null;
  environment = cfg.SENTRY_ENVIRONMENT;

  if (dsn) {
    const parsed = parseDsn(dsn);
    if (!parsed) {
      logger.warn("Invalid SENTRY_DSN format, Sentry disabled");
      dsn = null;
      return;
    }
    enabled = true;
    logger.info("Sentry initialized", { level: "info" });
  } else {
    logger.info("Sentry not configured (set SENTRY_DSN to enable)");
  }
}

export async function captureError(
  error: Error,
  category: ErrorCategory,
  toolName?: string
): Promise<void> {
  if (!enabled || !dsn) return;

  const parsed = parseDsn(dsn);
  if (!parsed) return;

  const event: SentryEvent = {
    event_id: crypto.randomUUID().replace(/-/g, "").slice(0, 32),
    timestamp: new Date().toISOString(),
    platform: "node",
    level: "error",
    culprit: toolName ?? "unknown",
    exception: {
      values: [
        {
          type: error.name || "Error",
          value: error.message,
          stacktrace: error.stack
            ? {
                frames: error.stack
                  .split("\n")
                  .slice(1, 11)
                  .map((line) => {
                    const m = /at\s+(?:async\s+)?(?:(.+?)\s+\()?(.+?):(\d+):(\d+)/.exec(line);
                    return {
                      filename: m?.[2] ?? "unknown",
                      function: m?.[1] ?? "anonymous",
                      lineno: Number(m?.[3]) || 0,
                    };
                  }),
              }
            : undefined,
        },
      ],
    },
    tags: {
      category,
      tool: toolName ?? "unknown",
      environment,
    },
    extra: {
      error_category: category,
    },
    contexts: {
      runtime: {
        name: "bun",
        version: Bun.version,
      },
    },
  };

  try {
    const body = JSON.stringify(event);
    const payload = createSentryEnvelope(parsed.publicKey, body);

    await fetch(
      `https://${parsed.host}/api/${parsed.projectId}/envelope/`,
      {
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/x-sentry-envelope",
        },
      }
    );
  } catch (err) {
    logger.warn("Failed to send error to Sentry", { error: err });
  }
}

function createSentryEnvelope(publicKey: string, body: string): Uint8Array {
  const header = JSON.stringify({
    event_id: JSON.parse(body).event_id,
    dsn: `https://${publicKey}@${parseDsn(dsn!)?.host}/${parseDsn(dsn!)?.projectId}`,
    sdk: { name: "dev-mcp", version: "1.0.0" },
  });

  const itemHeader = JSON.stringify({
    type: "event",
    content_type: "application/json",
  });

  const encoder = new TextEncoder();
  const parts = [
    encoder.encode(header + "\n"),
    encoder.encode(itemHeader + "\n"),
    encoder.encode(body),
  ];

  const total = parts.reduce((acc, p) => acc + p.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    result.set(p, offset);
    offset += p.length;
  }
  return result;
}

export async function flushSentry(): Promise<void> {
  if (!enabled) return;
  // Allow pending send to complete
  await Bun.sleep(100);
}
