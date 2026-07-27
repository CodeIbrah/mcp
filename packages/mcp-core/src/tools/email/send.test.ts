/**
 * @module tools/email/send.test — Unit tests for the send-email tool.
 *
 * Since actual SMTP requires credentials, we test validation and
 * edge cases. The send path is tested via a nodemailer mock.
 *
 * We mock the env module so tests don't depend on process.env values
 * (which are shared across parallel test files in bun).
 */

import { describe, it, expect, mock } from "bun:test";

// ── Mock env module BEFORE importing ./send ───────────

const mockEnv = {
  GITHUB_TOKEN: "test-token",
  LOG_LEVEL: "info",
  NODE_ENV: "test",
  SENTRY_ENVIRONMENT: "development",
  HOST: "0.0.0.0",
  PORT: 3001,
  CORS_ORIGIN: "*",
  SMTP_HOST: "smtp.example.com",
  SMTP_PORT: 587,
  SMTP_USER: "user@example.com",
  SMTP_PASS: "secret",
  SMTP_FROM: "test@example.com",
  SLACK_WEBHOOK_URL: undefined,
  CONTEXT7_API_KEY: undefined,
  EXA_API_KEY: undefined,
  SENTRY_DSN: undefined,
};

// No-op clearEnv since mock is stateless
const clearEnv = () => {};

mock.module("../../config/env", () => ({
  getEnv: () => mockEnv,
  loadEnv: () => mockEnv,
  clearEnv,
}));

// ── Mock nodemailer ───────────────────────────────────

const mockSendMail = mock(async () => ({
  messageId: "<mock-msgid@example.com>",
  accepted: ["recipient@example.com"],
  rejected: [],
}));

mock.module("nodemailer", () => ({
  default: {
    createTransport: () => ({
      sendMail: mockSendMail,
      close: () => {},
    }),
  },
}));

// ── Import AFTER mocks ────────────────────────────────

const mod = await import("./send");

// ── Tests ─────────────────────────────────────────────

describe("email.send", () => {
  it("should have correct tool name and description", () => {
    expect(mod.sendEmailTool.name).toBe("email.send");
    expect(mod.sendEmailTool.description).toContain("SMTP");
  });

  it("should define input schema with to, subject, text, html", () => {
    const schema = mod.sendEmailTool.inputSchema;
    expect(schema.properties).toHaveProperty("to");
    expect(schema.properties).toHaveProperty("subject");
    expect(schema.properties).toHaveProperty("text");
    expect(schema.properties).toHaveProperty("html");
    expect(schema.required).toContain("to");
    expect(schema.required).toContain("subject");
  });

  it("should reject missing required fields", async () => {
    const result = await mod.sendEmailTool.handler({
      to: "",
      subject: "",
    });
    expect(result.isError).toBe(true);
    const body = result.content[0].text;
    expect(body).toContain("VALIDATION");
  });

  it("should reject invalid email in 'to' field", async () => {
    const result = await mod.sendEmailTool.handler({
      to: "invalid",
      subject: "Test",
    });
    expect(result.isError).toBe(true);
    const body = result.content[0].text;
    expect(body).toContain("VALIDATION");
  });

  it("should send email and return messageId on success", async () => {
    const result = await mod.sendEmailTool.handler({
      to: "recipient@example.com",
      subject: "Hello from dev-mcp",
      text: "This is a test message.",
    });

    expect(result.isError).toBeFalsy();
    const body = JSON.parse(result.content[0].text);
    expect(body.success).toBe(true);
    expect(body.messageId).toContain("mock-msgid");
  });
});
