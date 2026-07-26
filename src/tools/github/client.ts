import { Octokit } from "@octokit/rest";
import { getEnv } from "../../config/env";
import { AuthenticationError, RateLimitError, IntegrationError } from "../../utils/errors";

let _octokit: Octokit | null = null;

export function getGitHubClient(): Octokit {
  if (_octokit) return _octokit;

  const token = getEnv().GITHUB_TOKEN;
  _octokit = new Octokit({ auth: token });
  return _octokit;
}

export function clearGitHubClient(): void {
  _octokit = null;
}

export async function handleGitHubError(err: unknown, toolName: string): Promise<never> {
  if (err && typeof err === "object" && "status" in err) {
    const status = (err as { status: number }).status;

    switch (status) {
      case 401:
        throw new AuthenticationError("GitHub authentication failed. Check your GITHUB_TOKEN.", toolName);
      case 403: {
        const msg = (err as { message?: string }).message ?? "";
        if (msg.includes("rate limit")) {
          throw new RateLimitError("GitHub rate limit exceeded. Try again later.", toolName);
        }
        throw new AuthenticationError("GitHub access denied. Check token permissions.", toolName);
      }
      case 404:
        throw new IntegrationError("GitHub resource not found. Check owner/repo/path.", toolName, err);
      case 422:
        throw new IntegrationError("GitHub validation error. Check your input parameters.", toolName, err);
    }
  }

  throw new IntegrationError(`GitHub request failed: ${(err as Error).message ?? "Unknown error"}`, toolName, err);
}
