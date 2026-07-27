import { describe, it, expect, vi, beforeEach } from "vitest";
import { loadEnv, getEnv } from "./env";

// The module-level _env cache persists across imports in bun's test runner
// (vi.mock/vi.importActual/vi.resetModules are not available). We test both
// full config and caching, acknowledging that the first call sets _env.

describe("loadEnv", () => {
  it("returns full env when all vars are set", () => {
    const original = { ...process.env };
    Object.assign(process.env, {
      GITHUB_TOKEN: "ghp_test_token_123",
      CONTEXT7_API_KEY: "ctx7_test",
      EXA_API_KEY: "exa_test",
      LOG_LEVEL: "debug",
      SENTRY_ENVIRONMENT: "staging",
      NODE_ENV: "production",
    });

    const env = loadEnv();

    process.env = original;
    expect(env.GITHUB_TOKEN).toBe("ghp_test_token_123");
    expect(env.CONTEXT7_API_KEY).toBe("ctx7_test");
    expect(env.EXA_API_KEY).toBe("exa_test");
    expect(env.LOG_LEVEL).toBe("debug");
    expect(env.SENTRY_ENVIRONMENT).toBe("staging");
    expect(env.NODE_ENV).toBe("production");
  });

  it("returns cached result on repeated calls", () => {
    const first = loadEnv();
    const second = loadEnv();
    expect(first).toBe(second);
  });

  it("cached result matches earlier call shape", () => {
    const env = loadEnv();
    expect(env).toHaveProperty("GITHUB_TOKEN");
    expect(env).toHaveProperty("LOG_LEVEL");
    expect(env).toHaveProperty("NODE_ENV");
    expect(env).toHaveProperty("SENTRY_ENVIRONMENT");
  });
});

describe("getEnv", () => {
  it("returns the same cached object as loadEnv", () => {
    expect(getEnv()).toBe(loadEnv());
  });
});
