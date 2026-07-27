import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Octokit } from "@octokit/rest";

vi.mock("./client", () => {
  const mockOctokit = {
    issues: { listForRepo: vi.fn(), get: vi.fn() },
  } as unknown as Octokit;
  return {
    getGitHubClient: vi.fn(() => mockOctokit),
    handleGitHubError: vi.fn((err: Error, _tool: string) => ({
      content: [{ type: "text" as const, text: JSON.stringify({ error: err.message }) }],
      isError: true,
    })),
  };
});

import { issuesListTool, issueGetTool } from "./issues";
import { getGitHubClient } from "./client";
import { mockIssueResult } from "../../test-utils/fixtures";

describe("issuesListTool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists issues with correct params and returns formatted result", async () => {
    const octokit = getGitHubClient();
    (octokit.issues.listForRepo as any).mockResolvedValue({ data: [mockIssueResult] });

    const result = await issuesListTool.handler({ owner: "vercel", repo: "turbo" });

    expect(octokit.issues.listForRepo).toHaveBeenCalledWith({
      owner: "vercel",
      repo: "turbo",
      state: "open",
      labels: undefined,
      per_page: 20,
      page: 1,
    });
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.count).toBe(1);
    expect(parsed.issues[0].number).toBe(42);
    expect(parsed.issues[0].title).toBe("Bug: something broke");
    expect(parsed.issues[0].state).toBe("open");
    expect(parsed.issues[0].author).toBe("user1");
    expect(parsed.issues[0].labels).toEqual(["bug"]);
  });

  it("filters by state and labels", async () => {
    const octokit = getGitHubClient();
    (octokit.issues.listForRepo as any).mockResolvedValue({ data: [mockIssueResult] });

    await issuesListTool.handler({
      owner: "vercel",
      repo: "turbo",
      state: "closed",
      labels: ["bug"],
    });

    expect(octokit.issues.listForRepo).toHaveBeenCalledWith({
      owner: "vercel",
      repo: "turbo",
      state: "closed",
      labels: "bug",
      per_page: 20,
      page: 1,
    });
  });

  it("returns empty list when no issues exist", async () => {
    const octokit = getGitHubClient();
    (octokit.issues.listForRepo as any).mockResolvedValue({ data: [] });

    const result = await issuesListTool.handler({ owner: "vercel", repo: "turbo" });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.count).toBe(0);
    expect(parsed.issues).toEqual([]);
  });

  it("handles GitHub API errors", async () => {
    const octokit = getGitHubClient();
    const err = new Error("Not Found");
    (octokit.issues.listForRepo as any).mockRejectedValue(err);

    const result = await issuesListTool.handler({ owner: "vercel", repo: "nonexistent" });

    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.error).toBe("Not Found");
  });
});

describe("issueGetTool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gets a single issue with correct params", async () => {
    const octokit = getGitHubClient();
    (octokit.issues.get as any).mockResolvedValue({ data: mockIssueResult });

    const result = await issueGetTool.handler({ owner: "vercel", repo: "turbo", issueNumber: 42 });

    expect(octokit.issues.get).toHaveBeenCalledWith({
      owner: "vercel",
      repo: "turbo",
      issue_number: 42,
    });
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.number).toBe(42);
    expect(parsed.title).toBe("Bug: something broke");
    expect(parsed.state).toBe("open");
    expect(parsed.author).toBe("user1");
    expect(parsed.labels).toEqual(["bug"]);
  });

  it("handles GitHub API errors", async () => {
    const octokit = getGitHubClient();
    const err = new Error("Not Found");
    (octokit.issues.get as any).mockRejectedValue(err);

    const result = await issueGetTool.handler({ owner: "vercel", repo: "turbo", issueNumber: 999 });

    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.error).toBe("Not Found");
  });
});
