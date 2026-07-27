import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Octokit } from "@octokit/rest";

vi.mock("./client", () => {
  const mockOctokit = {
    repos: { getContent: vi.fn() },
  } as unknown as Octokit;
  return {
    getGitHubClient: vi.fn(() => mockOctokit),
    handleGitHubError: vi.fn((err: Error, _tool: string) => ({
      content: [{ type: "text" as const, text: JSON.stringify({ error: err.message }) }],
      isError: true,
    })),
  };
});

import { fileReadTool } from "./file";
import { getGitHubClient } from "./client";
import { mockFileResult } from "../../test-utils/fixtures";

describe("fileReadTool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads and decodes a file", async () => {
    const octokit = getGitHubClient();
    (octokit.repos.getContent as any).mockResolvedValue({ data: mockFileResult });

    const result = await fileReadTool.handler({
      owner: "vercel",
      repo: "turbo",
      path: "README.md",
    });

    expect(octokit.repos.getContent).toHaveBeenCalledWith({
      owner: "vercel",
      repo: "turbo",
      path: "README.md",
    });
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.type).toBe("file");
    expect(parsed.path).toBe("README.md");
    expect(parsed.content).toBe("# Turbo\n\nBuild system");
    expect(parsed.sha).toBe("abc123");
  });

  it("accepts optional ref parameter", async () => {
    const octokit = getGitHubClient();
    (octokit.repos.getContent as any).mockResolvedValue({ data: mockFileResult });

    await fileReadTool.handler({
      owner: "vercel",
      repo: "turbo",
      path: "README.md",
      ref: "main",
    });

    expect(octokit.repos.getContent).toHaveBeenCalledWith({
      owner: "vercel",
      repo: "turbo",
      path: "README.md",
      ref: "main",
    });
  });

  it("returns directory entries when path is a directory", async () => {
    const octokit = getGitHubClient();
    (octokit.repos.getContent as any).mockResolvedValue({
      data: [
        { name: "src", path: "src", type: "dir", size: 0 },
        { name: "README.md", path: "README.md", type: "file", size: 64 },
      ],
    });

    const result = await fileReadTool.handler({
      owner: "vercel",
      repo: "turbo",
      path: "/",
    });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.type).toBe("directory");
    expect(parsed.entries).toHaveLength(2);
    expect(parsed.entries[0].name).toBe("src");
  });

  it("returns metadata for non-file types (symlink/submodule)", async () => {
    const octokit = getGitHubClient();
    (octokit.repos.getContent as any).mockResolvedValue({
      data: {
        type: "symlink",
        path: "link",
        name: "link",
        size: 10,
        sha: "abc",
        target: "actual-file",
      },
    });

    const result = await fileReadTool.handler({
      owner: "vercel",
      repo: "turbo",
      path: "link",
    });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.type).toBe("symlink");
    expect(parsed.path).toBe("link");
  });

  it("handles GitHub API errors", async () => {
    const octokit = getGitHubClient();
    const err = new Error("Not Found");
    (octokit.repos.getContent as any).mockRejectedValue(err);

    const result = await fileReadTool.handler({
      owner: "vercel",
      repo: "turbo",
      path: "missing.txt",
    });

    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.error).toBe("Not Found");
  });
});
