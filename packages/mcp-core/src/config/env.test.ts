import { describe, it, expect, beforeEach } from "vitest";
import { loadEnv, getEnv, clearEnv } from "./env";

// CRITICAL: Never do `process.env = original`. That replaces the global
// process.env object and breaks all parallel-running tests.
// We use save/restore of individual keys instead.

const TEST_TOKENS = {
  GITHUB_TOKEN: "ghp_test_token_123",
  CONTEXT7_API_KEY: "ctx7_test",
  EXA_API_KEY: "exa_test",
};

beforeEach(() => {
  clearEnv();
  // Ensure required env is present
  process.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN || TEST_TOKENS.GITHUB_TOKEN;
  process.env.CONTEXT7_API_KEY = process.env.CONTEXT7_API_KEY || TEST_TOKENS.CONTEXT7_API_KEY;
  process.env.EXA_API_KEY = process.env.EXA_API_KEY || TEST_TOKENS.EXA_API_KEY;
});

describe("loadEnv", () => {
  it("returns full env when all vars are set", () => {
    process.env.LOG_LEVEL = "debug";
    process.env.SENTRY_ENVIRONMENT = "staging";
    process.env.NODE_ENV = "production";

    clearEnv();
    const env = loadEnv();

    expect(env.GITHUB_TOKEN).toBeTruthy();
    expect(env.LOG_LEVEL).toBe("debug");
    expect(env.SENTRY_ENVIRONMENT).toBe("staging");
    expect(env.NODE_ENV).toBe("production");
  });

  it("returns cached result on repeated calls", () => {
    clearEnv();
    const first = loadEnv();
    const second = loadEnv();
    expect(first).toBe(second);
  });

  it("cached result matches earlier call shape", () => {
    clearEnv();
    const env = loadEnv();
    expect(env).toHaveProperty("GITHUB_TOKEN");
    expect(env).toHaveProperty("LOG_LEVEL");
    expect(env).toHaveProperty("NODE_ENV");
    expect(env).toHaveProperty("SENTRY_ENVIRONMENT");
  });
});

describe("getEnv", () => {
  it("returns the same cached object as loadEnv", () => {
    clearEnv();
    const env = loadEnv();
    expect(getEnv()).toBe(env);
  });
});
