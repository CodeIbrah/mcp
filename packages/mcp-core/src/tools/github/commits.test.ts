import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Octokit } from "@octokit/rest";

vi.mock("./client", () => {
  const mockOctokit = {
    search: { commits: vi.fn() },
  } as unknown as Octokit;
  return {
    getGitHubClient: vi.fn(() => mockOctokit),
    handleGitHubError: vi.fn((err: Error, _tool: string) => ({
      content: [{ type: "text" as const, text: JSON.stringify({ error: err.message }) }],
      isError: true,
    })),
  };
});

import { commitSearchTool } from "./commits";
import { getGitHubClient } from "./client";
import { mockCommitResult } from "../../test-utils/fixtures";

describe("commitSearchTool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searches commits with correct params and returns formatted result", async () => {
    const octokit = getGitHubClient();
    (octokit.search.commits as any).mockResolvedValue({
      data: { total_count: 1, incomplete_results: false, items: [mockCommitResult] },
    });

    const result = await commitSearchTool.handler({
      owner: "vercel",
      repo: "turbo",
      query: "fix timeout",
    });

    expect(octokit.search.commits).toHaveBeenCalledWith({
      q: "repo:vercel/turbo fix timeout",
      per_page: 10,
    });
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.totalCount).toBe(1);
    expect(parsed.commits).toHaveLength(1);
    expect(parsed.commits[0].sha).toBe("abc123");
    expect(parsed.commits[0].message).toBe("Fix: resolve timeout issue");
    expect(parsed.commits[0].author).toBe("Alice");
    expect(parsed.commits[0].date).toBe("2025-01-01T00:00:00Z");
  });

  it("returns empty list when no commits match", async () => {
    const octokit = getGitHubClient();
    (octokit.search.commits as any).mockResolvedValue({
      data: { total_count: 0, incomplete_results: false, items: [] },
    });

    const result = await commitSearchTool.handler({
      owner: "vercel",
      repo: "turbo",
      query: "nonexistent",
    });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.totalCount).toBe(0);
    expect(parsed.commits).toEqual([]);
  });

  it("handles GitHub API errors", async () => {
    const octokit = getGitHubClient();
    const err = new Error("Not Found");
    (octokit.search.commits as any).mockRejectedValue(err);

    const result = await commitSearchTool.handler({
      owner: "vercel",
      repo: "nonexistent",
      query: "fix",
    });

    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.error).toBe("Not Found");
  });
});
