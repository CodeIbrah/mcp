import { z } from "zod";

const envSchema = z.object({
  GITHUB_TOKEN: z.string().min(1, "GITHUB_TOKEN is required"),
  CONTEXT7_API_KEY: z.string().optional(),
  EXA_API_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function loadEnv(): Env {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues
      .filter((i) => i.code === "invalid_type")
      .map((i) => i.path.join("."));

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}. ` +
          `Create a .env file or set them in your environment.`
      );
    }

    throw new Error(`Environment validation failed: ${result.error.message}`);
  }

  _env = result.data;
  return _env;
}

export function getEnv(): Env {
  if (!_env) return loadEnv();
  return _env;
}
