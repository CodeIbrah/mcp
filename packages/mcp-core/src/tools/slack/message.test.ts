/**
 * @module tools/slack/message.test — Unit tests for the send-slack-message tool.
 *
 * Mocks env module so tests don't depend on process.env values
 * (which are shared across parallel test files in bun).
 */

import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";

// ── Mock env module BEFORE importing ./message ────────

const mockEnv = {
  GITHUB_TOKEN: "test-token",
  LOG_LEVEL: "info",
  NODE_ENV: "test",
  SENTRY_ENVIRONMENT: "development",
  HOST: "0.0.0.0",
  PORT: 3001,
  CORS_ORIGIN: "*",
  SLACK_WEBHOOK_URL: "https://hooks.slack.com/services/T00/B00/xxx",
  SMTP_HOST: undefined,
  SMTP_PORT: undefined,
  SMTP_USER: undefined,
  SMTP_PASS: undefined,
  SMTP_FROM: undefined,
  CONTEXT7_API_KEY: undefined,
  EXA_API_KEY: undefined,
  SENTRY_DSN: undefined,
};

mock.module("../../config/env", () => ({
  getEnv: () => mockEnv,
  loadEnv: () => mockEnv,
  clearEnv: () => {},
}));

// ── Import AFTER mocks ────────────────────────────────

const mod = await import("./message");

// ── Helpers ───────────────────────────────────────────

function mockFetch(response: Response) {
  global.fetch = mock(async () => response) as unknown as typeof fetch;
}

// ── Tests ─────────────────────────────────────────────

describe("slack.send_message", () => {
  beforeEach(() => {
    mockFetch(new Response("ok", { status: 200 }));
  });

  afterEach(() => {
    mock.restore();
  });

  it("should have correct tool name and description", () => {
    expect(mod.sendSlackMessageTool.name).toBe("slack.send_message");
    expect(mod.sendSlackMessageTool.description).toContain("Slack");
  });

  it("should define input schema with channel and text", () => {
    const schema = mod.sendSlackMessageTool.inputSchema;
    expect(schema.properties).toHaveProperty("channel");
    expect(schema.properties).toHaveProperty("text");
    expect(schema.required).toContain("text");
  });

  it("should reject missing required 'text' field", async () => {
    const result = await mod.sendSlackMessageTool.handler({
      text: "",
    });
    expect(result.isError).toBe(true);
    const body = result.content[0].text;
    expect(body).toContain("VALIDATION");
  });

  it("should send message and return success", async () => {
    const result = await mod.sendSlackMessageTool.handler({
      channel: "#general",
      text: "Hello from dev-mcp!",
    });

    expect(result.isError).toBeFalsy();
    const body = JSON.parse(result.content[0].text);
    expect(body.success).toBe(true);
    expect(body.channel).toBe("#general");
  });

  it("should return error on webhook failure", async () => {
    mockFetch(new Response("rate limited", { status: 429 }));

    const result = await mod.sendSlackMessageTool.handler({
      text: "Test message",
    });

    expect(result.isError).toBe(true);
    const body = result.content[0].text;
    expect(body).toContain("INTEGRATION");
  });
});
