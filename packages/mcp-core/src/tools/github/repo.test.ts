import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Octokit } from "@octokit/rest";

vi.mock("./client", () => {
  const mockOctokit = {
    search: { repos: vi.fn() },
    repos: { get: vi.fn() },
  } as unknown as Octokit;
  return {
    getGitHubClient: vi.fn(() => mockOctokit),
    handleGitHubError: vi.fn((err: Error, _tool: string) => ({
      content: [{ type: "text" as const, text: JSON.stringify({ error: err.message }) }],
      isError: true,
    })),
  };
});

import { repoSearchTool, repoReadTool } from "./repo";
import { getGitHubClient } from "./client";
import { mockRepoSearchResult, mockRepoReadResult } from "../../test-utils/fixtures";

describe("repoSearchTool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searches repos with correct params and returns formatted result", async () => {
    const octokit = getGitHubClient();
    (octokit.search.repos as any).mockResolvedValue({ data: mockRepoSearchResult });

    const result = await repoSearchTool.handler({ query: "turbo", perPage: 5 });

    expect(octokit.search.repos).toHaveBeenCalledWith({ q: "turbo", per_page: 5, page: 1 });
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.totalCount).toBe(42);
    expect(parsed.repos).toHaveLength(1);
    expect(parsed.repos[0].fullName).toBe("vercel/turbo");
    expect(parsed.repos[0].description).toBe("Turborepo — monorepo build system");
    expect(parsed.repos[0].stars).toBe(30_000);
  });

  it("returns empty repos array when no matches", async () => {
    const octokit = getGitHubClient();
    (octokit.search.repos as any).mockResolvedValue({
      data: { total_count: 0, incomplete_results: false, items: [] },
    });

    const result = await repoSearchTool.handler({ query: "nonexistent" });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.totalCount).toBe(0);
    expect(parsed.repos).toEqual([]);
  });

  it("handles GitHub API errors", async () => {
    const octokit = getGitHubClient();
    const err = new Error("API rate limit exceeded");
    (octokit.search.repos as any).mockRejectedValue(err);

    const result = await repoSearchTool.handler({ query: "turbo" });

    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.error).toBe("API rate limit exceeded");
  });
});

describe("repoReadTool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads repo details with correct params", async () => {
    const octokit = getGitHubClient();
    (octokit.repos.get as any).mockResolvedValue({ data: mockRepoReadResult });

    const result = await repoReadTool.handler({ owner: "vercel", repo: "turbo" });

    expect(octokit.repos.get).toHaveBeenCalledWith({ owner: "vercel", repo: "turbo" });
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.fullName).toBe("vercel/turbo");
    expect(parsed.description).toBe("Turborepo — monorepo build system");
    expect(parsed.stars).toBe(30_000);
    expect(parsed.forks).toBe(500);
    expect(parsed.defaultBranch).toBe("main");
    expect(parsed.license).toBe("MIT");
  });

  it("handles GitHub API errors", async () => {
    const octokit = getGitHubClient();
    const err = new Error("Not Found");
    (octokit.repos.get as any).mockRejectedValue(err);

    const result = await repoReadTool.handler({ owner: "vercel", repo: "nonexistent" });

    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.error).toBe("Not Found");
  });
});
