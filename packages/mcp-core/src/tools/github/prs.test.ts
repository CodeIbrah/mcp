import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Octokit } from "@octokit/rest";

vi.mock("./client", () => {
  const mockOctokit = {
    pulls: { list: vi.fn(), get: vi.fn() },
  } as unknown as Octokit;
  return {
    getGitHubClient: vi.fn(() => mockOctokit),
    handleGitHubError: vi.fn((err: Error, _tool: string) => ({
      content: [{ type: "text" as const, text: JSON.stringify({ error: err.message }) }],
      isError: true,
    })),
  };
});

import { prsListTool, prDiffTool } from "./prs";
import { getGitHubClient } from "./client";
import { mockPullRequestResult } from "../../test-utils/fixtures";

describe("prsListTool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists PRs with correct params and returns formatted result", async () => {
    const octokit = getGitHubClient();
    (octokit.pulls.list as any).mockResolvedValue({ data: [mockPullRequestResult] });

    const result = await prsListTool.handler({ owner: "vercel", repo: "turbo" });

    expect(octokit.pulls.list).toHaveBeenCalledWith({
      owner: "vercel",
      repo: "turbo",
      state: "open",
      per_page: 20,
      page: 1,
    });
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.count).toBe(1);
    expect(parsed.pullRequests[0].number).toBe(99);
    expect(parsed.pullRequests[0].title).toBe("Feature: add new API");
    expect(parsed.pullRequests[0].state).toBe("open");
    expect(parsed.pullRequests[0].author).toBe("author1");
  });

  it("supports pagination params", async () => {
    const octokit = getGitHubClient();
    (octokit.pulls.list as any).mockResolvedValue({ data: [] });

    await prsListTool.handler({
      owner: "vercel",
      repo: "turbo",
      state: "closed",
      perPage: 5,
      page: 2,
    });

    expect(octokit.pulls.list).toHaveBeenCalledWith({
      owner: "vercel",
      repo: "turbo",
      state: "closed",
      per_page: 5,
      page: 2,
    });
  });

  it("returns empty list when no PRs exist", async () => {
    const octokit = getGitHubClient();
    (octokit.pulls.list as any).mockResolvedValue({ data: [] });

    const result = await prsListTool.handler({ owner: "vercel", repo: "turbo" });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.count).toBe(0);
    expect(parsed.pullRequests).toEqual([]);
  });

  it("handles GitHub API errors", async () => {
    const octokit = getGitHubClient();
    const err = new Error("Not Found");
    (octokit.pulls.list as any).mockRejectedValue(err);

    const result = await prsListTool.handler({ owner: "vercel", repo: "nonexistent" });

    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.error).toBe("Not Found");
  });
});

describe("prDiffTool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gets PR diff with correct params", async () => {
    const octokit = getGitHubClient();
    const diff = "--- a/src/main.ts\n+++ b/src/main.ts\n@@ -1,3 +1,4 @@\n+console.log('hello');";
    (octokit.pulls.get as any).mockResolvedValue({ data: diff });

    const result = await prDiffTool.handler({
      owner: "vercel",
      repo: "turbo",
      pullNumber: 101,
    });

    expect(octokit.pulls.get).toHaveBeenCalledWith({
      owner: "vercel",
      repo: "turbo",
      pull_number: 101,
      mediaType: { format: "diff" },
    });
    const text = result.content[0].text;
    expect(text).toContain("+++ b/src/main.ts");
  });

  it("handles GitHub API errors", async () => {
    const octokit = getGitHubClient();
    const err = new Error("Not Found");
    (octokit.pulls.get as any).mockRejectedValue(err);

    const result = await prDiffTool.handler({
      owner: "vercel",
      repo: "turbo",
      pullNumber: 999,
    });

    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.error).toBe("Not Found");
  });
});
