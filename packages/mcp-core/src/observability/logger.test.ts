import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock env dependency ──────────────────────────────────────

const mockGetEnv = vi.fn();
vi.mock("../config/env", () => ({
  getEnv: mockGetEnv,
}));

// ── Module under test ──────────────────────────────────────────

import { logger } from "./logger";

describe("logger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("level filtering", () => {
    it("calls console.error for info when LOG_LEVEL is info", () => {
      mockGetEnv.mockReturnValue({ LOG_LEVEL: "info" });
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      logger.info("hello");
      expect(spy).toHaveBeenCalledOnce();

      spy.mockRestore();
    });

    it("suppresses debug when LOG_LEVEL is info", () => {
      mockGetEnv.mockReturnValue({ LOG_LEVEL: "info" });
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      logger.debug("should not appear");
      expect(spy).not.toHaveBeenCalled();

      spy.mockRestore();
    });

    it("suppresses debug and info when LOG_LEVEL is warn", () => {
      mockGetEnv.mockReturnValue({ LOG_LEVEL: "warn" });
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      logger.debug("no");
      logger.info("no");
      logger.warn("yes");
      expect(spy).toHaveBeenCalledTimes(1);

      spy.mockRestore();
    });

    it("suppresses everything when LOG_LEVEL is error", () => {
      mockGetEnv.mockReturnValue({ LOG_LEVEL: "error" });
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      logger.debug("no");
      logger.info("no");
      logger.warn("no");
      logger.error("yes");
      expect(spy).toHaveBeenCalledTimes(1);

      spy.mockRestore();
    });

    it("logs everything when LOG_LEVEL is debug", () => {
      mockGetEnv.mockReturnValue({ LOG_LEVEL: "debug" });
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      logger.debug("d");
      logger.info("i");
      logger.warn("w");
      logger.error("e");
      expect(spy).toHaveBeenCalledTimes(4);

      spy.mockRestore();
    });
  });

  describe("info", () => {
    it("is a callable function", () => {
      mockGetEnv.mockReturnValue({ LOG_LEVEL: "info" });
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => logger.info("test")).not.toThrow();
      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });

    it("accepts optional meta", () => {
      mockGetEnv.mockReturnValue({ LOG_LEVEL: "info" });
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      logger.info("with meta", { toolName: "x", durationMs: 10 });
      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });
  });

  describe("warn", () => {
    it("is a callable function", () => {
      mockGetEnv.mockReturnValue({ LOG_LEVEL: "warn" });
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => logger.warn("warn test")).not.toThrow();
      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });
  });

  describe("error", () => {
    it("is a callable function", () => {
      mockGetEnv.mockReturnValue({ LOG_LEVEL: "error" });
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => logger.error("error test")).not.toThrow();
      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });

    it("accepts an Error object in meta", () => {
      mockGetEnv.mockReturnValue({ LOG_LEVEL: "error" });
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      logger.error("something broke", { error: new Error("root") });
      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });

    it("accepts error as string in meta", () => {
      mockGetEnv.mockReturnValue({ LOG_LEVEL: "error" });
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      logger.error("string error", { error: "oops" });
      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });
  });

  describe("debug", () => {
    it("is a callable function", () => {
      mockGetEnv.mockReturnValue({ LOG_LEVEL: "debug" });
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => logger.debug("debug msg")).not.toThrow();
      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });
  });
});
